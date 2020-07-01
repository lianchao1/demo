package com.youku.demo.utils;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import com.googlecode.aviator.AviatorEvaluator;

public class Check {
	public static void main(String[] args) {
		String expression = "'A'+a+b+c";
		Map<String, Object> params = new HashMap<>();
		params.put("a", 14);
		params.put("b", 2);
		params.put("c", 3);
		params.put("test", "killme2008@ss.ccc");
		String result = (String) AviatorEvaluator.execute(expression, params);

		System.out.println("result:" + result);

		Boolean result1 = (Boolean) AviatorEvaluator.execute("test=~/([\\w0-8]+@\\w+[\\.\\w+]+)/ ",params);
		System.out.println(result1);
		String result2 = (String) AviatorEvaluator.execute("'killme2008@gmail.com'=~/([\\w0-8]+@\\w+[\\.\\w+]+)/ ? $1:'unknow'");  
		System.out.println(result2);

		String pattern = "^(\\(\\d{3,4}\\)|\\d{3,4}-|\\s)?\\d{7,14}$";

		boolean isMatch = Pattern.matches(pattern, "(0599)3266759");
		System.out.println(isMatch);
		
	}
}
