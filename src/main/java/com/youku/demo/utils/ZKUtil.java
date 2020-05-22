package com.youku.demo.utils;

import java.io.UnsupportedEncodingException;

import org.I0Itec.zkclient.IZkDataListener;
import org.I0Itec.zkclient.ZkClient;
import org.I0Itec.zkclient.exception.ZkMarshallingError;
import org.I0Itec.zkclient.serialize.ZkSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ZKUtil {
	private final static Logger logger = LoggerFactory.getLogger(ZKUtil.class);

	// 此demo使用的集群，所以有多个ip和端口
	private static String CONNECT_SERVER = "127.0.0.1:2181";
	private static int SESSION_TIMEOUT = 3000;
	private static int CONNECTION_TIMEOUT = 3000;
	private static ZkClient zkClient;

	static {
		zkClient = new ZkClient(CONNECT_SERVER, SESSION_TIMEOUT, CONNECTION_TIMEOUT, new MyZkSerializer());
	}

	public static void main(String[] args) {
		add("/test", "javaCoder");
		addDiGui("/a/b/c");

		subscribe("/test");

		delete("/test");
		deleteDiGui("/a/b");
	}

	public static String read(String dataPath) {
		String value = null;
		if (!zkClient.exists(dataPath)) {
			value = zkClient.readData("/test");
			logger.debug("zk路径{} = {}", dataPath, value);
		}
		return value;
	}

	public static void update(String dataPath, String data) {
		if (zkClient.exists(dataPath)) {
			zkClient.writeData(dataPath, data);
			// 查询一下，看是否修改成功
			String value = zkClient.readData(dataPath);
			logger.debug("修改zk路径{} = {} {}", dataPath, data, (value.equals(data) ? "成功" : "失败"));
		}
	}

	public static void add(String dataPath) {
		// 如果不存在节点，就新建一个节点
		if (!zkClient.exists(dataPath)) {
			zkClient.createPersistent(dataPath);
			logger.debug("创建zk路径{}成功", dataPath);
		}
	}

	public static void add(String dataPath, String data) {
		// 如果不存在节点，就新建一个节点
		if (!zkClient.exists(dataPath)) {
			zkClient.createPersistent(dataPath, data);
			logger.debug("创建zk路径{} = {}成功", dataPath, data);
		}
	}

	public static void addDiGui(String dataPath) {
		// 递归创建节点
		zkClient.createPersistent(dataPath, true);
		if (zkClient.exists(dataPath)) {
			logger.debug("创建zk路径{} 增加成功", dataPath);
		} else {
			logger.debug("创建zk路径{} 增加失败", dataPath);
		}
	}

	public static void delete(String dataPath) {
		// 存在节点才进行删除
		if (zkClient.exists(dataPath)) {
			boolean flag = zkClient.delete(dataPath);
			logger.debug("删除zk路径{} {}", dataPath, (flag == true ? "成功" : "失败"));
		}
	}

	public static void deleteDiGui(String parentDataPath) {
		// 存在节点才进行删除
		if (zkClient.exists(parentDataPath)) {
			// 递归删除的时候 只传入 父节点就可以，如果传入 全部的节点，虽然返回的是true，但是依然是没有删除的，
			// 因为zkClient将异常封装好了，进入catch的时候，会返回true，这是一个坑
			boolean flag = zkClient.deleteRecursive(parentDataPath);
			logger.debug("删除zk路径{} {}", parentDataPath, (flag == true ? "成功" : "失败"));
		}
	}

	/**
	 * @Title: subscribe @Description: TODO(事件订阅, 可用于配置管理) 先订阅，再 操作增删改。（可多个
	 * 客户端订阅） @param @param zkClient 设定文件 @return void 返回类型 @throws
	 */
	public static void subscribe(String dataPath) {
		zkClient.subscribeDataChanges(dataPath, new IZkDataListener() {
			@Override
			public void handleDataDeleted(String dataPath) throws Exception {
				logger.debug("触发了删除事件：{}", dataPath);
			}

			@Override
			public void handleDataChange(String dataPath, Object data) throws Exception {
				logger.debug("触发了改变事件：{}-->{}", dataPath, data);
			}
		});
	}
}

class MyZkSerializer implements ZkSerializer {
	@Override
	public byte[] serialize(Object data) throws ZkMarshallingError {
		try {
			return String.valueOf(data).getBytes("UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public Object deserialize(byte[] bytes) throws ZkMarshallingError {
		try {
			return new String(bytes, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		return null;
	}
}