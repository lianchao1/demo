package com.youku.demo.config;

import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

/**
 * @author wwx
 * @Title: ErrorPageConfig
 * @Description:
 * @date 2019/9/20 17:26
 */
@Configuration
public class ErrorPageConfig {

    private static final String ERROR_PAGE_PATH = "/html/error";

    @Bean
    public WebServerFactoryCustomizer<ConfigurableWebServerFactory> webServerFactoryCustomizer() {
//        //第一种：java7 常规写法
//        return new WebServerFactoryCustomizer<ConfigurableWebServerFactory>() {
//            @Override
//            public void customize(ConfigurableWebServerFactory factory) {
//                ErrorPage errorPage404 = new ErrorPage(HttpStatus.NOT_FOUND, "/404.html");
//                factory.addErrorPages(errorPage404);
//            }
//        };

        //第二种写法：java8 lambda写法
        return (factory -> {
//            ErrorPage errorPage404 = new ErrorPage(HttpStatus.NOT_FOUND, "/404.html");
            factory.addErrorPages(new ErrorPage(HttpStatus.NOT_FOUND, ERROR_PAGE_PATH + "/404.html"));
            factory.addErrorPages(new ErrorPage(HttpStatus.UNAUTHORIZED, ERROR_PAGE_PATH + "/401.html"));
            factory.addErrorPages(new ErrorPage(HttpStatus.INTERNAL_SERVER_ERROR, ERROR_PAGE_PATH + "/500.html"));
        });
    }
}
