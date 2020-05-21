package com.youku.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewResolverRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.view.InternalResourceViewResolver;

/**
 * @author wwx
 * @Title: WebAppConfigurer
 * @Description:
 * @date 2019/8/27 09:50
 */
@Configuration
public class WebAppConfigurer implements WebMvcConfigurer {
    private final static Logger logger = LoggerFactory.getLogger(WebAppConfigurer.class);

    private static final String[] CLASSPATH_RESOURCE_LOCATIONS = {
            "classpath:/META-INF/resources/",
            "classpath:/resources/",
            "classpath:/public/",
            "classpath:/static/",
    };

    /**
     * 配置静态页面请求处理
     */
    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        InternalResourceViewResolver viewResolver = new InternalResourceViewResolver();
        viewResolver.setPrefix("html/");
        viewResolver.setSuffix(".html");

        registry.viewResolver(viewResolver);
        registry.order(1);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        //addResourceHandler是指你想在url请求的路径
        //addResourceLocations是图片存放的真实路径
        registry.addResourceHandler("/**/**")
                .addResourceLocations(CLASSPATH_RESOURCE_LOCATIONS);
    }


    // 这个方法用来注册拦截器，我们自己写好的拦截器需要通过这里添加注册才能生效
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
		/*
        registry.addInterceptor(ssoInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/login/**")
                .excludePathPatterns("/sso/**")
                .excludePathPatterns("/images/**")
                .excludePathPatterns("/js/**")
		        .excludePathPatterns("/error");
		*/
    }


}
