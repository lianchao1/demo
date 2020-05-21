package com.youku.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;


@EnableWebMvc
@ComponentScan({"com.youku"})
//@ServletComponentScan({"com.iron.smsso"})
@SpringBootApplication(exclude={DataSourceAutoConfiguration.class})
public class DemoWebApplication {
	private final static Logger logger = LoggerFactory.getLogger(DemoWebApplication.class);  

    public static void main(String[] args) {
        ApplicationContext applicationContext = SpringApplication.run(DemoWebApplication.class, args);
        logger.error("WEB项目启动完成");
//        System.out.println(ApplicationContextUtil.getActiveProfile());
    }


}
