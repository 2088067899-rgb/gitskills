<template>
  <div class="layout">
    <!-- 左侧菜单 -->
    <div class="sidebar" :class="{ collapsed }">
      <div class="logo">
        <RocketOutlined v-if="collapsed" />
        <template v-else>芮柠网络后台 v5</template>
      </div>
      <a-menu 
        v-model:selectedKeys="selectedKeys" 
        v-model:openKeys="openKeys"
        theme="dark" 
        mode="inline" 
        :inline-collapsed="collapsed"
        @click="handleMenuClick"
        @openChange="handleOpenChange"
      >
        <!-- 活动管理 -->
        <a-sub-menu key="activity">
          <template #title>
            <span class="sub-menu-title">
              <RocketOutlined />
              <span v-if="!collapsed">活动管理</span>
            </span>
          </template>
          <a-menu-item key="/campaign/list">
            <span>活动列表</span>
          </a-menu-item>
        </a-sub-menu>

        <!-- 用户管理 -->
        <a-sub-menu key="user">
          <template #title>
            <span class="sub-menu-title">
              <UserOutlined />
              <span v-if="!collapsed">用户管理</span>
            </span>
          </template>
          <a-menu-item key="/user/list">
            <span>用户列表</span>
          </a-menu-item>
        </a-sub-menu>

        <!-- 佣金管理 -->
        <a-sub-menu key="commission">
          <template #title>
            <span class="sub-menu-title">
              <DollarOutlined />
              <span v-if="!collapsed">佣金管理</span>
            </span>
          </template>
          <a-menu-item key="/commission/list">
            <span>佣金列表</span>
          </a-menu-item>
          <a-menu-item key="/red-packet/list">
            <span>红包列表</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </div>
    
    <!-- 右侧内容 -->
    <div class="main" :style="{ marginLeft: collapsed ? '80px' : '240px' }">
      <!-- 顶部导航 -->
      <a-layout-header class="header">
        <div class="header-left">
          <MenuFoldOutlined v-if="!collapsed" @click="collapsed = true" style="font-size: 18px; cursor: pointer; margin-right: 16px" />
          <MenuUnfoldOutlined v-else @click="collapsed = false" style="font-size: 18px; cursor: pointer; margin-right: 16px" />
          <span class="header-title">营销管理系统</span>
        </div>
        <div class="header-right">
          <a-badge :count="3">
            <BellOutlined style="font-size: 18px; cursor: pointer; margin-right: 16px" />
          </a-badge>
          <a-dropdown>
            <a-space style="cursor: pointer">
              <a-avatar style="background-color: #1890ff">管</a-avatar>
              <span>管理员</span>
            </a-space>
            <template #overlay>
              <a-menu>
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined /> 退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>
      
      <!-- 页面内容 -->
      <a-layout-content class="content">
        <RouterView />
      </a-layout-content>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RocketOutlined, UserOutlined, DollarOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined, LogoutOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const selectedKeys = ref([route.path])
const openKeys = ref([])

watch(() => route.path, (newPath) => {
  selectedKeys.value = [newPath]
  const menuMap = {
    '/campaign/list': 'activity',
    '/user/list': 'user',
    '/commission/list': 'commission',
    '/red-packet/list': 'commission'
  }
  const parentKey = menuMap[newPath]
  if (parentKey && !openKeys.value.includes(parentKey)) {
    openKeys.value = [parentKey]
  }
})

const handleMenuClick = ({ key }) => {
  router.push(key)
}

const handleOpenChange = (keys) => {
  openKeys.value = keys
}

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.layout { min-height: 100vh; }
.sidebar { width: 240px; background: #001529; color: white; position: fixed; height: 100vh; z-index: 100; transition: width 0.2s; }
.sidebar.collapsed { width: 80px; }
.logo { height: 64px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1); }
.main { margin-left: 240px; transition: margin-left 0.2s; }
.header { background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); height: 64px; }
.header-left { display: flex; align-items: center; }
.header-title { font-size: 18px; font-weight: 500; }
.header-right { display: flex; align-items: center; }
.content { padding: 24px; background: #f0f2f5; min-height: calc(100vh - 64px); }

:deep(.ant-menu-dark) {
  background: #001529;
}
:deep(.ant-menu-submenu-title) {
  font-weight: 600;
  font-size: 15px;
  color: #fff;
  padding-left: 24px !important;
}
:deep(.ant-menu-inline .ant-menu-item) {
  padding-left: 48px !important;
  font-size: 14px;
}
:deep(.ant-menu-dark .ant-menu-inline.ant-menu-sub) {
  background: #000c17;
}
:deep(.sub-menu-title) {
  display: flex;
  align-items: center;
  gap: 8px;
}
:deep(.ant-menu-item-selected) {
  background-color: #67C23A !important;
  color: #fff !important;
}
</style>
