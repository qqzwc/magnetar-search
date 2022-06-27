import axios from 'axios'
import { Message, Notice, Spin } from 'view-design';
import store from '../store/index.js';
import { getToken } from '@/utils/auth'
import {
    baseURL,
} from '@/config'
// 创建axios实例
const service = axios.create({
    baseURL, // api 的 base_url
    timeout: 20000 // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
    config => {
        if (getToken()) {
            config.headers['token'] = getToken() // 让每个请求携带自定义token
        }
        return config
    },
    error => {
        // Do something with request error
        console.log(error) // for debug
        Promise.reject(error)
    }
)

// response 拦截器
service.interceptors.response.use(
    response => {
        const res = response.data
        console.log("res", res)
        if (res.code === 200 || res.code === 0) {
            return res.data
        }
        if (res.code === 301) {
            window.location.href = res.href;
        }
        if (res.code === 401) {
            console.log("token过期或不合法")
            Notice.warning({
                title: '温馨提示',
                desc: '登陆状态已过期,请前往扩展程序或登陆页重新登陆',
                duration: 10,
            });
            setTimeout(() => {
                store.dispatch('user/FedLogOut').then(() => {
                    location.href = '/login'
                    //location.reload() // 为了重新实例化vue-router对象 避免bug
                })
            }, 3000)
        }
        if (res.code === 403) {
            Message.warning({
                content: "请求参数含非法字符"
            })
        }
        Spin.hide();
        Message.destroy();
        Message.error(res[store.getters['app/language']])
        return Promise.reject(res)
    },
    error => {
        Spin.hide();
        Message.destroy();
        console.log("error");
        console.log(error);
        console.log(error.response);
        if (error.response && error.response.status == 403) {
            Message.warning({
                content: "请求参数含非法字符"
            })
        } else {
            console.log('interceptorsERROR:%o', error) // for debug
            Message.warning({
                content: "接口异常"
            })
        }

        return Promise.reject(error)

    }
)

export default service