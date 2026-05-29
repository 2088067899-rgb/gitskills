<template>
  <div class="user-page">
    <div class="page-header">
      <div class="breadcrumb">
        <span class="current">活动管理</span>
        <span class="separator"> &gt; </span>
        <span class="current">用户列表</span>
      </div>
      <a-button type="primary" @click="handleEnterGroup">进入改团</a-button>
    </div>

    <a-card class="search-card">
      <a-row :gutter="16" align="middle">
        <a-col :span="3">
          <a-form-item label="团长/团员">
            <a-select v-model:value="searchForm.team_role" placeholder="请选择" allow-clear style="width: 100%">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="leader">团长</a-select-option>
              <a-select-option value="member">团员</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="3">
          <a-form-item label="用户权限">
            <a-select v-model:value="searchForm.permission" placeholder="请选择" allow-clear style="width: 100%">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="normal">普通用户</a-select-option>
              <a-select-option value="staff">员工权限</a-select-option>
              <a-select-option value="boss">老板权限</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="3">
          <a-form-item label="黑名单">
            <a-select v-model:value="searchForm.blacklist" placeholder="请选择" allow-clear style="width: 100%">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="yes">已拉黑</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="3">
          <a-form-item label="导出排序">
            <a-select v-model:value="searchForm.export_sort" placeholder="请选择" allow-clear style="width: 100%">
              <a-select-option value="">默认排序</a-select-option>
              <a-select-option value="team">按战队排序</a-select-option>
              <a-select-option value="option">按选项排序</a-select-option>
              <a-select-option value="group">按团排序</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="3">
          <a-form-item label="微信单号">
            <a-input v-model:value="searchForm.transaction_id" placeholder="请输入" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item label="支付时间">
            <a-range-picker v-model:value="searchForm.pay_time" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="4">
          <a-form-item label="选择活动">
            <a-select v-model:value="searchForm.campaign_id" placeholder="请选择活动" allow-clear style="width: 100%">
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="item in campaignList" :key="item.id" :value="item.id">
                {{ item.code }}-{{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="1" style="text-align: right;">
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleExport">导出</a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <a-card class="table-card">
      <a-table :columns="columns" :data-source="tableData" :pagination="pagination" :loading="loading" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'nickname'">
            <div class="user-nickname-cell">
              <a-avatar :size="36">{{ record.nickname?.charAt(0) }}</a-avatar>
              <div class="user-info">
                <div class="nickname">{{ record.nickname }}</div>
                <div class="date">{{ record.register_date }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'commission'">
            <span class="commission">¥{{ record.commission?.toFixed(2) || '0.00' }}</span>
          </template>
          <template v-else-if="column.key === 'register'">
            <div class="info-cell">
              <div>姓名: {{ record.name || '-' }}</div>
              <div>电话: {{ record.phone || '-' }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'recommend'">
            <div class="info-cell">
              <div>推荐人: {{ record.referrer || '-' }}</div>
              <div>推荐员工: {{ record.referrer_staff || '-' }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'group'">
            <div class="info-cell">
              <div>身份: {{ record.team_role === 'leader' ? '团长' : '团员' }}</div>
              <div>权限: {{ getPermissionText(record.permission) }}</div>
              <div class="campaign-link">
                <a @click="handleViewCampaign(record)">{{ record.campaign_id }}</a>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'other'">
            <div class="other-cell">
              <div class="remark">备注: {{ record.remark || '无' }}</div>
              <div class="action-buttons">
                <a-button :type="record.pay_status === 'paid' ? 'default' : 'primary'" size="small">
                  {{ record.pay_status === 'paid' ? '已支付' : '未支付' }}
                </a-button>
                <a-button :type="record.blacklisted ? 'default' : 'primary'" size="small">
                  {{ record.blacklisted ? '已拉黑' : '未拉黑' }}
                </a-button>
                <a-button type="primary" size="small" @click="handleBlacklist(record)">拉黑</a-button>
              </div>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import * as XLSX from 'xlsx'

const loading = ref(false)

const searchForm = reactive({
  team_role: '',
  permission: '',
  blacklist: '',
  export_sort: '',
  transaction_id: '',
  pay_time: null,
  campaign_id: ''
})

const campaignList = ref([
  { id: 1, code: 'A2026011160273', name: '瑞颜阁美容养生会所 制定美丽 专业呵护 VIP内购会限量秒杀' },
  { id: 2, code: 'A2026010772128', name: 'U·娜调肤会所年终答谢会福利299元限时秒杀上万元福利大礼' },
  { id: 3, code: 'A2025121357460', name: '【阳明医美】冬季宠粉盛典 680元撬动万元美丽' },
  { id: 4, code: 'A2025121134583', name: '【叶子.禾壹净】 双12. 爱你有我. 闺蜜同行' },
  { id: 5, code: 'A2025121156402', name: '胭脂堂 感恩回馈 限时秒杀 VIP内购会 超值福利' },
  { id: 6, code: 'A2025120619177', name: '【东森自然美】双12. 感恩有你. 闺蜜同行' },
  { id: 7, code: 'A2025112465089', name: '漾美国际 限时·限购 感恩回馈 限时秒杀' },
  { id: 8, code: 'A2025103037457', name: '皇朝粉黛 老带新客内购会感恩回馈 限时秒杀享受上万元福利项目' },
  { id: 9, code: 'A2025102226550', name: '名媛坊 老客内购会 感恩回馈 限时秒杀' },
  { id: 10, code: 'A2025101941272', name: '【克丽缇娜】 女神"爱你有我"福利卡' },
  { id: 11, code: 'A2025101669183', name: '三穗娇兰佳人 双十一感恩回馈' },
  { id: 12, code: 'A2025101242368', name: '御颜尚宫美容养生会所携手总公司"宠粉福利会"' },
  { id: 13, code: 'A2025100557207', name: '临沂 《新生活化妆品》 总部扶持 百万补贴 宠粉节 福利秒杀' },
  { id: 14, code: 'A2025092732087', name: '娇兰佳人老店新迁开业庆典' },
  { id: 15, code: 'A2025092123176', name: '娇兰佳人 老店新迁开业庆典' }
])

const columns = [
  { title: '微信昵称', key: 'nickname', width: 180 },
  { title: '佣金', key: 'commission', width: 100 },
  { title: '报名信息', key: 'register', width: 160 },
  { title: '推荐信息', key: 'recommend', width: 160 },
  { title: '拼团信息', key: 'group', width: 180 },
  { title: '其他', key: 'other', width: 200 }
]

const tableData = ref([])
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` })

const getPermissionText = (permission) => {
  const map = { normal: '普通用户', staff: '员工权限', boss: '老板权限' }
  return map[permission] || permission
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        nickname: '美美的猫',
        commission: 100.00,
        campaign_id: 'A2026011160273',
        register_date: '2026-03-01',
        name: '张三',
        phone: '138****8001',
        team_role: 'leader',
        permission: 'normal',
        blacklisted: false,
        pay_status: 'paid',
        referrer: '-',
        referrer_staff: '-',
        remark: ''
      },
      {
        id: 2,
        nickname: '健康生活',
        commission: 50.00,
        campaign_id: 'A2026011160273',
        register_date: '2026-03-01',
        name: '李四',
        phone: '138****8002',
        team_role: 'member',
        permission: 'normal',
        blacklisted: false,
        pay_status: 'paid',
        referrer: '美美的猫',
        referrer_staff: '-',
        remark: ''
      },
      {
        id: 3,
        nickname: '阳光小分队',
        commission: 0,
        campaign_id: 'A2026010772128',
        register_date: '2026-03-02',
        name: '王五',
        phone: '138****8003',
        team_role: 'leader',
        permission: 'staff',
        blacklisted: false,
        pay_status: 'pending',
        referrer: '-',
        referrer_staff: '员工A',
        remark: 'VIP客户'
      },
      {
        id: 4,
        nickname: '美丽人生',
        commission: 80.00,
        campaign_id: 'A2025121357460',
        register_date: '2026-03-03',
        name: '赵六',
        phone: '138****8004',
        team_role: 'member',
        permission: 'boss',
        blacklisted: true,
        pay_status: 'paid',
        referrer: '阳光小分队',
        referrer_staff: '-',
        remark: ''
      },
      {
        id: 5,
        nickname: '时尚达人',
        commission: 0,
        campaign_id: 'A2026011160273',
        register_date: '2026-03-04',
        name: '钱七',
        phone: '138****8005',
        team_role: 'member',
        permission: 'normal',
        blacklisted: false,
        pay_status: 'unpaid',
        referrer: '美美的猫',
        referrer_staff: '-',
        remark: ''
      },
      {
        id: 6,
        nickname: '快乐天使',
        commission: 120.00,
        campaign_id: 'A2026011160273',
        register_date: '2026-03-05',
        name: '孙八',
        phone: '138****8006',
        team_role: 'leader',
        permission: 'staff',
        blacklisted: false,
        pay_status: 'paid',
        referrer: '-',
        referrer_staff: '员工B',
        remark: ''
      },
      {
        id: 7,
        nickname: '活力青春',
        commission: 60.00,
        campaign_id: 'A2025121134583',
        register_date: '2026-03-06',
        name: '周九',
        phone: '138****8007',
        team_role: 'member',
        permission: 'normal',
        blacklisted: false,
        pay_status: 'paid',
        referrer: '快乐天使',
        referrer_staff: '-',
        remark: ''
      },
      {
        id: 8,
        nickname: '幸福时光',
        commission: 90.00,
        campaign_id: 'A2025121134583',
        register_date: '2026-03-07',
        name: '吴十',
        phone: '138****8008',
        team_role: 'member',
        permission: 'boss',
        blacklisted: false,
        pay_status: 'paid',
        referrer: '快乐天使',
        referrer_staff: '-',
        remark: ''
      },
      {
        id: 9,
        nickname: '温馨家园',
        commission: 0,
        campaign_id: 'A2025121156402',
        register_date: '2026-03-08',
        name: '郑一',
        phone: '138****8009',
        team_role: 'leader',
        permission: 'normal',
        blacklisted: false,
        pay_status: 'pending',
        referrer: '-',
        referrer_staff: '-',
        remark: ''
      }
    ]
    pagination.total = 9
    loading.value = false
  }, 500)
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadData()
}

const handleBlacklist = (record) => {
  record.blacklisted = !record.blacklisted
  message.success(record.blacklisted ? '已拉黑用户' : '已取消拉黑')
}

const handleEnterGroup = () => {
  message.info('进入改团模式')
}

const handleViewCampaign = (record) => {
  message.info(`查看活动: ${record.campaign_id}`)
}

const handleExport = () => {
  const exportData = tableData.value.map(item => ({
    '微信昵称': item.nickname,
    '佣金': item.commission,
    '姓名': item.name,
    '电话': item.phone,
    '推荐人': item.referrer,
    '推荐员工': item.referrer_staff,
    '身份': item.team_role === 'leader' ? '团长' : '团员',
    '权限': getPermissionText(item.permission),
    '活动编号': item.campaign_id,
    '备注': item.remark || '无',
    '支付状态': item.pay_status === 'paid' ? '已支付' : item.pay_status === 'pending' ? '待支付' : '未支付',
    '黑名单': item.blacklisted ? '已拉黑' : '未拉黑',
    '注册日期': item.register_date
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '用户列表')
  XLSX.writeFile(wb, `用户列表_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.xlsx`)
  message.success('导出成功')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-page { padding: 24px; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.breadcrumb .current { font-size: 16px; }
.breadcrumb .separator { color: #999; margin: 0 4px; }

.search-card { margin-bottom: 16px; }

.user-nickname-cell { display: flex; align-items: center; gap: 12px; }
.user-nickname-cell .nickname { font-weight: 500; }
.user-nickname-cell .date { font-size: 12px; color: #999; }

.commission { color: #f5222d; font-weight: 500; }

.info-cell { font-size: 13px; line-height: 1.8; }

.campaign-link a { color: #1890ff; }
.campaign-link a:hover { text-decoration: underline; }

.other-cell .remark { margin-bottom: 8px; font-size: 13px; }
.action-buttons { display: flex; gap: 4px; flex-wrap: wrap; }

:deep(.ant-form-item) { margin-bottom: 0; }
:deep(.ant-card-body) { padding: 0; }
:deep(.ant-table-thead > tr > th) { background: #fafafa; }
:deep(.ant-table-tbody > tr > td) { padding: 12px 16px; }
</style>
