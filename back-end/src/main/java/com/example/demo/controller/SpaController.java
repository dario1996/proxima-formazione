package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Redirect all non-API requests to Angular SPA
    @RequestMapping(value = {
            "/",
            "/home/**",
            "/dashboard/**",
            "/login/**",
            "/logout/**",
            "/settings/**",
            "/error/**",
            "/welcome/**",
            "/registrazione/**"
    })
    public String redirect() {
        // Forward to Angular index.html to handle client-side routing
        return "forward:/index.html";
    }
}