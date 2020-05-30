package com.youku.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;

/**
 * @author wwx
 * @Title: IndexController
 * @Description:
 * @date 2019/8/27 11:36
 */
@Controller
@RequestMapping("/")
public class IndexController {

    @ResponseBody
    @GetMapping("/index")
    public String index(){
        return "index";
    }


    @GetMapping("/welcome")
    public String welcome(){
        return "html/index";
    }

    @GetMapping("/xx")
    public String xx(){
        return "xx/index";
    }

    @GetMapping("/xxx")
    public ModelAndView xxx(HttpServletRequest request){
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("xx/index");
        modelAndView.addObject("xxx","xxx");
        request.setAttribute("xxxx","requestxxx");
        return modelAndView;
    }
}
