package com.youku.demo.test;

import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.context.annotation.ImportBeanDefinitionRegistrar;
import org.springframework.core.type.AnnotationMetadata;

public class TestImportBeanDefinitionRegistrar implements ImportBeanDefinitionRegistrar {

	@Override
	public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {

        RootBeanDefinition dog = new RootBeanDefinition(Dog.class);
        registry.registerBeanDefinition("dog",dog);
        RootBeanDefinition cat = new RootBeanDefinition(Cat.class);
        registry.registerBeanDefinition("cat",cat);
	}
}
