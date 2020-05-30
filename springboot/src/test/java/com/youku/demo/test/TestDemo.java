package com.youku.demo.test;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

//@Import({Dog.class,Cat.class})
//@Import({TestImportSelector.class})
@Import({TestImportBeanDefinitionRegistrar.class})
public class TestDemo {
	public TestDemo() {
		System.out.println("------");
	}
	@Bean("bb")
	public Chicken getXx() {
		return new Chicken();
	}
}