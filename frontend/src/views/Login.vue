<template>
  <div style="height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea,#764ba2)">
    <div style="width:400px;padding:40px;background:white;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,0.2)">
      <h2 style="text-align:center;margin-bottom:30px">营销管理系统</h2>
      <a-form :model="form" @finish="onLogin">
        <a-form-item name="username" :rules="[{required:true,message:'请输入用户名'}]">
          <a-input v-model:value="form.username" placeholder="用户名" size="large" />
        </a-form-item>
        <a-form-item name="password" :rules="[{required:true,message:'请输入密码'}]">
          <a-input-password v-model:value="form.password" placeholder="密码" size="large" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">登录</a-button>
        </a-form-item>
      </a-form>
      <p style="text-align:center;color:#666">测试: admin / admin123</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const router = useRouter()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

const onLogin = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    if (form.username === 'admin' && form.password === 'admin123') {
      localStorage.setItem('token', 'mock-token')
      message.success('登录成功')
      router.push('/campaign/list')
    } else {
      message.error('用户名或密码错误')
    }
  }, 500)
}
</script>
