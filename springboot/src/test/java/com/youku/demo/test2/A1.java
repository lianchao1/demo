package com.youku.demo.test2;


public interface A1 {
	void a();
	default String b() {
		return "b";
	}
	default String bb() {
		return "bb";
	}
}
