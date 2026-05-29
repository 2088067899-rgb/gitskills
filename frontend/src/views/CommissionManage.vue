<template>
  <div class="commission-page">
    <div class="page-header">
      <h2>佣金管理</h2>
      <p>查看和管理用户佣金</p>
    </div>
    
    <a-card>
      <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id">
        <template #type="{ text }">
          <a-tag :color="text === 'commission' ? 'blue' : 'green'">
            {{ text === 'commission' ? '推广佣金' : '活动奖励' }}
          </a-tag>
        </template>
        <template #status="{ text }">
          <a-tag :color="text === 'pending' ? 'orange' : text === 'paid' ? 'green' : 'red'">
            {{ text === 'pending' ? '待结算' : text === 'paid' ? '已结算' : '已取消' }}
          </a-tag>
        </template>
        <template #action>
          <a-space>
            <a-button size="small" type="link">详情</a-button>
            <a-button size="small" type="link">结算</a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const columns = [
  { title: '订单号', dataIndex: 'order_id', width: 180 },
  { title: '用户', dataIndex: 'username', width: 120 },
  { title: '类型', dataIndex: 'type', width: 100, slots: { customRender: 'type' } },
  { title: '金额', dataIndex: 'amount', width: 120 },
  { title: '状态', dataIndex: 'status', width: 100, slots: { customRender: 'status' } },
  { title: '创建时间', dataIndex: 'created_at', width: 180 },
  { title: '操作', key: 'action', width: 150, slots: { customRender: 'action' } }
]

const tableData = ref([
  { id: 1, order_id: 'CM202601001', username: '张三', type: 'commission', amount: '¥50.00', status: 'paid', created_at: '2024-01-15 10:30:00' },
  { id: 2, order_id: 'CM202601002', username: '李四', type: 'reward', amount: '¥100.00', status: 'pending', created_at: '2024-01-15 11:20:00' },
  { id: 3, order_id: 'CM202601003', username: '王五', type: 'commission', amount: '¥80.00', status: 'paid', created_at: '2024-01-15 14:15:00' }
])

const pagination = reactive({ current: 1, pageSize: 10, total: 3 })
</script>

<style scoped>
.commission-page { padding: 24px; }
.page-header { margin-bottom: 24px; }
.page-header h2 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
.page-header p { color: #999; font-size: 14px; }
</style>
