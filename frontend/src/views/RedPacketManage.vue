<template>
  <div class="redpacket-page">
    <div class="page-header">
      <h2>红包列表</h2>
      <p>查看红包发放记录</p>
    </div>
    
    <!-- 统计 -->
    <a-row :gutter="16" class="stats-row">
      <a-col :span="6">
        <a-card>
          <div class="stat-number">1,234</div>
          <div class="stat-label">发放总数</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <div class="stat-number" style="color: #52c41a">¥56,780</div>
          <div class="stat-label">发放金额</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <div class="stat-number" style="color: #faad14">890</div>
          <div class="stat-label">领取人数</div>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <div class="stat-number" style="color: #1890ff">72%</div>
          <div class="stat-label">领取率</div>
        </a-card>
      </a-col>
    </a-row>
    
    <a-card>
      <a-table :columns="columns" :data-source="tableData" :pagination="pagination" row-key="id">
        <template #type="{ text }">
          <a-tag :color="text === 'register' ? 'blue' : text === 'invite' ? 'purple' : 'activity' ? 'green' : 'orange'">
            {{ { register: '注册红包', invite: '邀请红包', activity: '活动红包', reward: '奖励红包' }[text] }}
          </a-tag>
        </template>
        <template #status="{ text }">
          <a-tag :color="text === 'received' ? 'green' : text === 'sent' ? 'blue' : 'default'">
            {{ text === 'received' ? '已领取' : text === 'sent' ? '已发放' : '未领取' }}
          </a-tag>
        </template>
        <template #action>
          <a-space>
            <a-button size="small" type="link">详情</a-button>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const columns = [
  { title: '红包ID', dataIndex: 'redpacket_id', width: 150 },
  { title: '用户', dataIndex: 'username', width: 120 },
  { title: '类型', dataIndex: 'type', width: 100, slots: { customRender: 'type' } },
  { title: '金额', dataIndex: 'amount', width: 100 },
  { title: '状态', dataIndex: 'status', width: 100, slots: { customRender: 'status' } },
  { title: '发放时间', dataIndex: 'created_at', width: 180 },
  { title: '操作', key: 'action', width: 100, slots: { customRender: 'action' } }
]

const tableData = ref([
  { id: 1, redpacket_id: 'RP202601001', username: '张三', type: 'register', amount: '¥10.00', status: 'received', created_at: '2024-01-15 10:30:00' },
  { id: 2, redpacket_id: 'RP202601002', username: '李四', type: 'invite', amount: '¥50.00', status: 'received', created_at: '2024-01-15 11:20:00' },
  { id: 3, redpacket_id: 'RP202601003', username: '王五', type: 'activity', amount: '¥100.00', status: 'sent', created_at: '2024-01-15 14:15:00' }
])

const pagination = reactive({ current: 1, pageSize: 10, total: 3 })
</script>

<style scoped>
.redpacket-page { padding: 24px; }
.page-header { margin-bottom: 24px; }
.page-header h2 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
.page-header p { color: #999; font-size: 14px; }
.stats-row { margin-bottom: 16px; }
.stat-number { font-size: 28px; font-weight: 600; color: #1890ff; }
.stat-label { color: #999; font-size: 14px; margin-top: 4px; }
</style>
