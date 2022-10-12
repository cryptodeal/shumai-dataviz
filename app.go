package main

import (
	"encoding/json"
	"io/ioutil"
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

// parse stats from server
func(a *App) LoadStats(uri string) string {
	var f interface{}
	resp, err := http.Get(uri)
   if err != nil {
      fmt.Println(err)
			return "{}"
   }

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
		return "{}"
	}
	// closes resp body @ end of function
	defer resp.Body.Close()
	 
	sb := []byte(body)
	err = json.Unmarshal(sb, &f)
	if err != nil {
		fmt.Println(err)
		return "{}"
  }

	res, err := json.Marshal(f)
	if err != nil {
		fmt.Println(err)
		return "{}"
  }
	return string(res)
}