package com.youku.demo.test2;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class A2 {

	public static void main(String[] args) {
		List<String> names = Arrays.asList("peter", "anna", "mike", "xenia");

		Collections.sort(names, new Comparator<String>() {
			@Override
			public int compare(String a, String b) {
				return b.compareTo(a);
			}
		});

	}

	static int outerStaticNum;
	int outerNum;

	void testScopes() {
		int num = 1;
		Converter<Integer, String> stringConverter1 = (from) -> {
			outerNum = 23;
//            num = 2;
			return String.valueOf(from+num);
		};

		Converter<Integer, String> stringConverter2 = (from) -> {
			outerStaticNum = 72;
			return String.valueOf(from);
		};
	}
	void testScopes2() {
		int num = 1;
		Converter<Integer, String> stringConverter1 = new Converter<Integer, String>(){
			@Override
			public String convert(Integer from) {
	            outerNum = 23;
//	            num = 2;
	            return String.valueOf(from+num);
			}
			
		};

		Converter<Integer, String> stringConverter2 = (from) -> {
			outerStaticNum = 72;
			String $ffString="ddd";
			System.out.println($ffString);
			return String.valueOf(from);
		};
	}
}

@FunctionalInterface
interface Converter<F, T> {
	T convert(F from);
}