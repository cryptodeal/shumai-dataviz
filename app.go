package main

import (
	"encoding/json"
	"io"
	"time"
	"strconv"
	"net/http"
	"context"
	"fmt"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func ParseData(obj interface{}) (int64, interface{}) {
	m := obj.(map[string]interface{})
	var res int64
	var stats interface{}
	for k, v := range m {
		if k == "bytes_used" {
			i, err := strconv.ParseInt(v.(string), 10, 64)
			if err != nil {
					panic(err)
			}
			res = i
			continue;
		}
		if k == "statistics" {
			stats = v
			continue;
		}
	}
	return res, stats
}



func ParseStats(obj interface{}) (map[string]int64, map[string]interface{}) {
	mem, stats := ParseData(obj)
	bytes_used := map[string]int64{
		"mem": mem,
	}
	route_stats := map[string]interface{}{}
	for k, v := range stats.(map[string]interface{}) {
		route_stats["/" + k] = v
	}
	m := obj.(map[string]interface{})
	for k, v := range m {
		switch vv := v.(type) {
			case string:
					continue;
			case float64:
					continue;
			case []interface{}:
					fmt.Println(k, "is an array:")
					for i, u := range vv {
							fmt.Println(i, u)
					}
			case interface{}:
					if k == "statistics" {
						continue
					} else {
						// TODO: get model stats
						bytes, stats := ParseData(v)
						bytes_used[string(k) + " - mem"] = bytes
						for k1, v1 := range stats.(map[string]interface{}) {
							route_stats[k + " /" + k1] = v1
						}
					}
			default:
					fmt.Println(k, "is of a type I don't know how to handle")
		}
	}
	return bytes_used, route_stats
}

func httpClient() *http.Client {
    client := &http.Client{
        Transport: &http.Transport{
					MaxConnsPerHost: 10,
        },
				Timeout: 2 * time.Second,
    }
    return client
}

var client = httpClient()

// parse stats from server
func(a *App) LoadStats(uri string) string {
	var f interface{}
	req, err := http.NewRequest("get", uri, nil)
  if err != nil {
		fmt.Println(err)
		return `{"bytes_used":{},"route_stats":{}}`
  }
	
	req.Header.Add("Accept", `application/json`)

	resp, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return `{"bytes_used":{},"route_stats":{}}`
	}

	// closes resp body @ end of function
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
		return `{"bytes_used":{},"route_stats":{}}`
	}

	 
	sb := []byte(body)
	err = json.Unmarshal(sb, &f)
	if err != nil {
		fmt.Println("body bytes: ", len(sb))
		fmt.Println(err)
		return `{"bytes_used":{},"route_stats":{}}`
  }

	bytes_used, route_stats := ParseStats(f)
	out := map[string]interface{}{
		"bytes_used": bytes_used,
		"route_stats": route_stats,
	}
	
	res, err := json.Marshal(out)
	if err != nil {
		fmt.Println(err)
		return `{"bytes_used":{},"route_stats":{}}`
  }
	return string(res)
}