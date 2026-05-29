<template>
  <div class="campaign-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h2>活动列表</h2>
        <p>管理您的营销活动，监控活动效果</p>
      </div>
      <div class="header-actions">
        <a-button type="primary" size="large" @click="showCreateModal">
          <template #icon><PlusOutlined /></template>
          添加活动
        </a-button>
        <a-button danger size="large" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
          批量删除
        </a-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <a-card class="search-card">
      <a-form layout="inline">
        <a-form-item label="活动名称">
          <a-input v-model:value="searchForm.title" placeholder="请输入活动名称" allow-clear style="width: 200px" />
        </a-form-item>
        <a-form-item label="收款商户">
          <a-select v-model:value="searchForm.merchant_id" placeholder="全部" allow-clear style="width: 150px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">双美拓客</a-select-option>
            <a-select-option value="2">瑞颜阁</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="活动状态">
          <a-select v-model:value="searchForm.status" placeholder="全部" allow-clear style="width: 120px">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="draft">未开始</a-select-option>
            <a-select-option value="active">进行中</a-select-option>
            <a-select-option value="paused">已暂停</a-select-option>
            <a-select-option value="ended">已结束</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
            <a-button @click="handleExport">导出</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 活动表格 -->
    <div class="table-wrapper">
      <a-card class="table-card">
        <a-table :columns="columns" :data-source="tableData" :pagination="pagination" :loading="loading" :row-selection="rowSelection" row-key="id" :scroll="{ x: 1400 }" @change="handleTableChange">
        <!-- 首图 -->
        <template #coverImage="{ record }">
          <div class="cover-image" @click="handlePreview(record)">
            <img v-if="record.cover_image" :src="record.cover_image" alt="封面" />
            <div v-else class="cover-placeholder">
              <PictureOutlined />
            </div>
          </div>
        </template>

        <!-- 活动状态（编号+开关） -->
        <template #status="{ record }">
          <div class="status-cell">
            <div class="campaign-id">编号：{{ record.campaign_id }}</div>
            <a-switch 
              :checked="record.status === 'active'" 
              checked-children="激活" 
              un-checked-children="禁用"
              size="small"
              @click="handleToggleStatus(record)" 
            />
          </div>
        </template>

        <!-- 活动信息 -->
        <template #info="{ record }">
          <div class="info-cell">
            <div class="campaign-title">{{ record.title }}</div>
            <div class="register-link">
              <a-tooltip title="点击复制注册链接">
                <a @click.stop="handleCopyLink(record)">注册：点击复制</a>
              </a-tooltip>
            </div>
            <div class="merchant-name">收款商户：{{ record.merchant_name }}</div>
          </div>
        </template>

        <!-- 活动时间 -->
        <template #time="{ record }">
          <div class="time-cell">
            <div>开始：{{ formatDateTime(record.start_time) }}</div>
            <div>结束：{{ formatDateTime(record.end_time) }}</div>
            <div class="time-status">状态：{{ record.status === 'ended' ? '已结束' : '进行中' }}</div>
          </div>
        </template>

        <!-- 基本数据 -->
        <template #basicData="{ record }">
          <div class="data-row">
            <span>浏览 {{ record.views }}</span>
            <span>参与 {{ record.participates }}</span>
            <span>报名 {{ record.registrations }}</span>
            <span>支付 {{ record.payments }}</span>
            <span>线下 {{ record.offline }}</span>
          </div>
        </template>

        <!-- 结算数据 -->
        <template #settleData="{ record }">
          <div class="data-row">
            <span>收款 {{ record.revenue?.toFixed(2) || '0.00' }}</span>
            <span>手续费 {{ record.fee?.toFixed(2) || '0.00' }}</span>
            <span>佣金 {{ record.commission || 0 }}</span>
            <span>红包 {{ record.redPacket || 0 }}</span>
            <span>提现 {{ record.withdraw || 0 }}</span>
            <span>余额 {{ record.balance?.toFixed(2) || '0.00' }}</span>
          </div>
        </template>

        <!-- 其他功能 -->
        <template #otherFunc="{ record }">
          <div class="other-func-cell">
            <div class="func-row">
              <a-button type="link" size="small">分销</a-button>
              <a-button type="link" size="small">拼团</a-button>
            </div>
            <div class="func-row">
              <a-button type="link" size="small">核销</a-button>
            </div>
          </div>
        </template>

        <!-- 解冻时间 -->
        <template #unfreezeTime="{ record }">
          <div class="unfreeze-time">未结算</div>
        </template>

        <!-- 操作 -->
        <template #action="{ record }">
          <div class="action-cell">
            <a-button size="small">编辑海报</a-button>
            <a-button size="small">编辑活动</a-button>
            <a-button size="small" danger>解冻</a-button>
          </div>
        </template>
      </a-table>
      </a-card>
    </div>

    <!-- 创建/编辑活动弹窗 -->
    <a-modal v-model:open="modalVisible" :title="isEdit ? '编辑活动' : '添加活动'" width="900px" :confirm-loading="modalLoading" @ok="handleSubmit" @cancel="modalVisible = false">
      <a-form :model="form" layout="vertical" ref="formRef">
        <!-- 基础信息 -->
        <a-divider>基础信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="收款商户" name="merchant_id">
              <a-select v-model:value="form.merchant_id" placeholder="必选，支付方式创建之后不能修改">
                <a-select-option value="双美拓客1718143771">双美拓客1718143771 (双美拓客-M848331979223739)</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="活动名称" name="title">
              <a-input v-model:value="form.title" placeholder="请输入活动名称" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 时间设置 -->
        <a-divider>时间设置</a-divider>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="开始时间" name="start_time">
              <a-date-picker v-model:value="form.start_time" style="width: 100%" show-time />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="结束时间" name="end_time">
              <a-date-picker v-model:value="form.end_time" style="width: 100%" show-time />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="核销结束时间" name="verify_end_time">
              <a-date-picker v-model:value="form.verify_end_time" style="width: 100%" show-time />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 媒体配置 -->
        <a-divider>媒体配置</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="活动音乐" name="music_url">
              <a-input v-model:value="form.music_url" placeholder="请输入活动音乐地址" />
              <div class="upload-box mt-8">
                <a-upload :before-upload="() => false" :show-upload-list="false">
                  <a-button>导入音频文件</a-button>
                </a-upload>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商品图片及轮播展示图片" name="images">
              <a-radio-group v-model:value="form.image_type">
                <a-radio value="single">单张首图</a-radio>
                <a-radio value="carousel">多张轮播</a-radio>
              </a-radio-group>
              <a-upload :before-upload="() => false" :show-upload-list="false" class="mt-8">
                <a-button icon="Upload">上传图片</a-button>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="轮播图高度" name="carousel_height">
              <a-input-number v-model:value="form.carousel_height" :min="0" style="width: 100%" addon-after="px" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 虚拟数据 -->
        <a-divider>虚拟数据</a-divider>
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item label="虚拟浏览量" name="virtual_views">
              <a-input-number v-model:value="form.virtual_views" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="虚拟参与量" name="virtual_participates">
              <a-input-number v-model:value="form.virtual_participates" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="虚拟分享量" name="virtual_shares">
              <a-input-number v-model:value="form.virtual_shares" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item label="虚拟报名量" name="virtual_registrations">
              <a-input-number v-model:value="form.virtual_registrations" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 底部按钮配置 -->
        <a-divider>底部按钮配置</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="底部按钮1">
              <a-input v-model:value="form.btn1_text" placeholder="例：￥99.00\n立即报名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="支付金额1">
              <a-input-number v-model:value="form.btn1_amount" :min="0" style="width: 100%" addon-after="元" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="底部按钮2（可选）">
              <a-input v-model:value="form.btn2_text" placeholder="可选，不填不显示（开团）" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="支付金额2">
              <a-input-number v-model:value="form.btn2_amount" :min="0" style="width: 100%" addon-after="元" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="底部按钮3（可选）">
              <a-input v-model:value="form.btn3_text" placeholder="可选，不填不显示（拼团）" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="支付金额3">
              <a-input-number v-model:value="form.btn3_amount" :min="0" style="width: 100%" addon-after="元" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 商家信息 -->
        <a-divider>商家信息</a-divider>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="商家名称" name="shop_name">
              <a-input v-model:value="form.shop_name" placeholder="请输入商家名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商家电话" name="shop_phone">
              <a-input v-model:value="form.shop_phone" placeholder="请输入商家电话" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="商家二维码">
              <a-upload :before-upload="() => false" :show-upload-list="false">
                <a-button icon="Upload">上传二维码</a-button>
              </a-upload>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商家地址" name="shop_address">
              <a-input v-model:value="form.shop_address" placeholder="请输入商家地址" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item label="纬度" name="latitude">
              <a-input v-model:value="form.latitude" placeholder="请输入纬度" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="经度" name="longitude">
              <a-input v-model:value="form.longitude" placeholder="请输入经度" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="导航背景颜色" name="nav_bg_color">
              <a-input v-model:value="form.nav_bg_color" placeholder="#FFFFFF" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 其他功能 -->
        <a-divider>其他功能</a-divider>
        <a-tabs v-model:activeKey="activeOtherTab" type="card">
          <!-- 分享配置 -->
          <a-tab-pane key="share" tab="分享配置">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="转发图片">
                  <a-upload :before-upload="() => false" :show-upload-list="false">
                    <a-button icon="Upload">上传图片</a-button>
                  </a-upload>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="转发标题">
                  <a-input v-model:value="form.share_title" placeholder="请输入转发标题" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="转发简介">
                  <a-textarea v-model:value="form.share_desc" placeholder="请输入转发简介" :rows="2" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="滚动通知">
                  <a-switch v-model:checked="form.enable_scroll_notice" checked-children="开启" un-checked-children="关闭" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="分享文案">
                  <a-textarea v-model:value="form.share_copywriting" placeholder="请输入分享文案" :rows="3" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>

          <!-- 报名配置 -->
          <a-tab-pane key="register" tab="报名配置">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item label="倒计时字体颜色">
                  <a-input v-model:value="form.countdown_font_color" placeholder="#FFFFFF" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="倒计时背景颜色">
                  <a-input v-model:value="form.countdown_bg_color" placeholder="#000000" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="选中颜色">
                  <a-input v-model:value="form.select_color" placeholder="#ff8c00" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="单选条件">
                  <a-radio-group v-model:value="form.single_condition">
                    <a-radio value="close">关闭</a-radio>
                    <a-radio value="group_only">只能开团</a-radio>
                    <a-radio value="group_unique">团唯一</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item label="最少选择机构数">
                  <a-input-number v-model:value="form.min_org_count" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="最多选择机构数">
                  <a-input-number v-model:value="form.max_org_count" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="最少选择课程数">
                  <a-input-number v-model:value="form.min_course_count" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="最多选择课程数">
                  <a-input-number v-model:value="form.max_course_count" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-form-item label="报名字段配置">
              <div class="field-list">
                <a-table :columns="fieldColumns" :data-source="form.fields" :pagination="false" size="small">
                  <template #bodyCell="{ column, record, index }">
                    <template v-if="column.key === 'type'">
                      <a-select v-model:value="record.type" style="width: 100%">
                        <a-select-option value="text">姓名</a-select-option>
                        <a-select-option value="phone">电话</a-select-option>
                        <a-select-option value="date">日期</a-select-option>
                        <a-select-option value="radio">单选</a-select-option>
                        <a-select-option value="checkbox">多选</a-select-option>
                        <a-select-option value="textarea">文本</a-select-option>
                      </a-select>
                    </template>
                    <template v-else-if="column.key === 'label'">
                      <a-input v-model:value="record.label" />
                    </template>
                    <template v-else-if="column.key === 'placeholder'">
                      <a-input v-model:value="record.placeholder" />
                    </template>
                    <template v-else-if="column.key === 'options'">
                      <a-input v-model:value="record.options" />
                    </template>
                    <template v-else-if="column.key === 'action'">
                      <a-space>
                        <a-button type="link" size="small" @click="moveField(index, -1)">↑</a-button>
                        <a-button type="link" size="small" @click="moveField(index, 1)">↓</a-button>
                        <a-button type="link" size="small" danger @click="removeField(index)">×</a-button>
                      </a-space>
                    </template>
                  </template>
                </a-table>
                <a-button type="dashed" block class="mt-8" @click="addField">+ 添加选项</a-button>
              </div>
            </a-form-item>
          </a-tab-pane>

          <!-- 分销配置 -->
          <a-tab-pane key="distribution" tab="分销配置">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="强制支付返佣">
                  <a-switch v-model:checked="form.force_commission" checked-children="开启" un-checked-children="关闭" />
                </a-form-item>
                <a-form-item label="分销排行榜">
                  <a-switch v-model:checked="form.distribution_ranking" checked-children="开启" un-checked-children="关闭" />
                </a-form-item>
                <a-form-item label="分销渠道">
                  <a-radio-group v-model:value="form.distribution_channel">
                    <a-radio value="merchant">商家转账</a-radio>
                    <a-radio value="wechat">
                      微信分账
                      <span style="color: #999; font-size: 12px;">（分账总额不能超过支付金额的29%）</span>
                    </a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="佣金总额">
                  <a-input-number v-model:value="form.commission_total" :min="0" :precision="2" style="width: 100%" addon-after="元" />
                </a-form-item>
                <a-form-item label="返佣简介">
                  <a-textarea v-model:value="form.commission_desc" placeholder="请输入返佣简介" :rows="4" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="客户分销">
                  <a-select v-model:value="form.customer_distribution" style="width: 100%">
                    <a-select-option value="close">关闭</a-select-option>
                    <a-select-option value="level1">开启一级分销</a-select-option>
                    <a-select-option value="level2">开启二级分销</a-select-option>
                    <a-select-option value="level3">开启三级分销</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="员工分销">
                  <a-select v-model:value="form.employee_distribution" style="width: 100%">
                    <a-select-option value="close">关闭</a-select-option>
                    <a-select-option value="level1">开启一级分销</a-select-option>
                    <a-select-option value="level2">开启二级分销</a-select-option>
                    <a-select-option value="level3">开启三级分销</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="员工溯源奖励">
                  <a-switch v-model:checked="form.employee_trace_reward" checked-children="开启" un-checked-children="关闭" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-divider style="margin: 16px 0;" />
            <a-row :gutter="16">
              <a-col :span="24">
                <p style="color: #999; font-size: 12px; text-align: center;">具体发放总额以实际对账为准</p>
              </a-col>
            </a-row>
          </a-tab-pane>

          <!-- 邀请浏览红包 -->
          <a-tab-pane key="inviteRedpacket" tab="邀请浏览红包">
            <a-form-item>
              <a-checkbox v-model:checked="form.invite_redpacket_enabled">邀请浏览红包</a-checkbox>
            </a-form-item>
            <a-row v-if="form.invite_redpacket_enabled" :gutter="16">
              <a-col :span="12">
                <a-form-item label="红包总额">
                  <a-input-number v-model:value="form.redpacket_total" :min="0" :precision="2" style="width: 100%" addon-after="元" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="每天发放次数">
                  <a-input-number v-model:value="form.redpacket_daily_limit" :min="0" style="width: 100%" addon-after="次" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-if="form.invite_redpacket_enabled" :gutter="16">
              <a-col :span="12">
                <a-form-item label="每人限领次数">
                  <a-input-number v-model:value="form.redpacket_per_user_limit" :min="1" style="width: 100%" addon-after="次" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="浏览秒数">
                  <a-input-number v-model:value="form.browse_seconds" :min="1" style="width: 100%" addon-after="秒" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-if="form.invite_redpacket_enabled" :gutter="16">
              <a-col :span="12">
                <a-form-item label="红包最小金额">
                  <a-input-number v-model:value="form.redpacket_min_amount" :min="0.01" :precision="2" style="width: 100%" addon-after="元" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="红包最大金额">
                  <a-input-number v-model:value="form.redpacket_max_amount" :min="0.01" :precision="2" style="width: 100%" addon-after="元" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row v-if="form.invite_redpacket_enabled" :gutter="16">
              <a-col :span="24">
                <a-form-item label="限制地区">
                  <a-input v-model:value="form.redpacket_restrict_regions" placeholder="请输入省市区" />
                  <p style="color: #999; font-size: 12px; margin-top: 4px;">限制红包发放的地区，可以限制多个。如：郑州市金水区<br />信阳市！</p>
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>

          <!-- 技术支持 -->
          <a-tab-pane key="support" tab="技术支持">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item>
                  <a-checkbox v-model:checked="form.show_complaint_phone">投诉电话</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item>
                  <a-checkbox v-model:checked="form.enable_consult_input">开启咨询录入</a-checkbox>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="电话">
                  <a-input v-model:value="form.support_phone" placeholder="请输入技术支持电话" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="网址">
                  <a-input v-model:value="form.support_website" placeholder="请输入技术支持网址" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="投诉电话">
                  <a-input v-model:value="form.complaint_phone" placeholder="请输入投诉电话" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-divider style="margin: 16px 0;" />
            <a-row :gutter="16">
              <a-col :span="24">
                <p style="color: #999; font-size: 12px;">
                  提示：电话或网址至少填写一项<br />
                  此网址只有首页展示
                </p>
              </a-col>
            </a-row>
          </a-tab-pane>

          <!-- 拼团配置 -->
          <a-tab-pane key="group" tab="拼团配置">
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="拼团功能">
                  <a-radio-group v-model:value="form.group_purchase_mode">
                    <a-radio value="close">关闭</a-radio>
                    <a-radio value="open">开启</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
            <template v-if="form.group_purchase_mode === 'open'">
              <a-row :gutter="16">
                <a-col :span="6">
                  <a-form-item>
                    <a-checkbox v-model:checked="form.allow_group_buy">开团/拼团</a-checkbox>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item>
                    <a-checkbox v-model:checked="form.enable_group_purchase">开启拼团</a-checkbox>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item>
                    <a-checkbox v-model:checked="form.nearby_group">附近拼团</a-checkbox>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item>
                    <a-checkbox v-model:checked="form.unlimited_members">不限团员</a-checkbox>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="6">
                  <a-form-item>
                    <a-checkbox v-model:checked="form.team_ranking">团队排行榜</a-checkbox>
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item>
                    <a-checkbox v-model:checked="form.phone_adjust_group">手机端调整团</a-checkbox>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="开团数">
                    <a-input-number v-model:value="form.max_groups_per_user" :min="1" style="width: 100%" addon-after="次" />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="团人数">
                    <a-input-number v-model:value="form.group_member_count" :min="2" style="width: 100%" addon-after="人" />
                  </a-form-item>
                </a-col>
              </a-row>
            </template>
          </a-tab-pane>

          <!-- 其他配置 -->
          <a-tab-pane key="other" tab="其他配置">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.enable_danmu">开启弹幕</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.enable_verification">开启核销</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.virtual_avatar">虚拟头像</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.fans_ranking">粉丝排行榜</a-checkbox>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.payment_tip">支付提示</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.promotion_list">推广列表</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.invitation_list">邀请列表</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.ad_list">推广列表</a-checkbox>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.latest_orders">最新订单</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.mobile_refund">手机退款</a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item>
                  <a-checkbox v-model:checked="form.mobile_modify_order">手机修改订单</a-checkbox>
                </a-form-item>
              </a-col>
            </a-row>
            <a-divider style="margin: 16px 0;" />
            <a-row :gutter="16">
              <a-col :span="6">
                <a-form-item label="弹幕行数">
                  <a-input-number v-model:value="form.danmu_lines" :min="0" style="width: 100%" addon-after="行" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="商户费率">
                  <a-input-number v-model:value="form.merchant_rate" :min="0" :step="0.001" :precision="3" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="核销次数">
                  <a-input-number v-model:value="form.verification_times" :min="1" style="width: 100%" addon-after="次" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="底部提示标签">
                  <a-input v-model:value="form.bottom_tip_label" placeholder="请输入底部提示" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="支付后提示弹窗">
                  <a-upload :before-upload="() => false" :show-upload-list="false">
                    <a-button icon="Upload">上传图片</a-button>
                  </a-upload>
                  <p style="color: #999; font-size: 12px; margin-top: 4px;">上传包含完整文案的弹窗图片</p>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="封禁关键词">
                  <a-input v-model:value="form.banned_keywords" placeholder="多个词用竖线分隔，如：老师|网络|传媒" />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="禁止地区">
                  <a-input v-model:value="form.restricted_areas" placeholder="多个地区用竖线分隔，如：郑州市|河南省|信阳市" />
                  <p style="color: #999; font-size: 12px; margin-top: 4px;">限制活动参与范围，不填则全国开放</p>
                </a-form-item>
              </a-col>
            </a-row>
            <a-divider style="margin: 16px 0;" />
            <a-row :gutter="16">
              <a-col :span="24">
                <a-form-item label="开屏提示">
                  <a-radio-group v-model:value="form.splash_screen_status">
                    <a-radio value="enabled">启用</a-radio>
                    <a-radio value="disabled">已停用开屏提示</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="开屏提示复制内容">
                  <a-input v-model:value="form.splash_screen_copy_content" placeholder="请输入复制内容" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="支付提示内容">
                  <a-input v-model:value="form.payment_tip_content" placeholder="请输入支付提示内容" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>
        </a-tabs>

        <!-- 活动结束图片 -->
        <a-divider>活动结束图片</a-divider>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="结束文字">
              <a-input v-model:value="form.end_text" placeholder="请输入活动结束页面显示的文字" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="结束图片">
              <a-upload :before-upload="() => false" :show-upload-list="false">
                <a-button icon="Upload">上传图片</a-button>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>

        <!-- 活动富文本详情 -->
        <a-divider>活动富文本详情</a-divider>
        <a-row :gutter="16">
          <a-col :span="24">
            <a-form-item label="活动详情">
              <a-textarea v-model:value="form.rich_content" placeholder="请输入活动详情内容" :rows="6" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>

    <!-- 批量删除弹窗 -->
    <a-modal v-model:open="batchModalVisible" title="批量删除" width="600px">
      <p>已选择 {{ selectedRowKeys.length }} 项数据</p>
      <a-divider>可修改的数据</a-divider>
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="活动状态">
              <a-select placeholder="请选择">
                <a-select-option value="draft">未开始</a-select-option>
                <a-select-option value="active">进行中</a-select-option>
                <a-select-option value="paused">已暂停</a-select-option>
                <a-select-option value="ended">已结束</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="收款商户">
              <a-select placeholder="请选择">
                <a-select-option value="双美拓客1718143771">双美拓客</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="batchModalVisible = false">取消</a-button>
          <a-button type="primary" danger @click="confirmBatchDelete">确认删除</a-button>
        </a-space>
      </template>
    </a-modal>

    <!-- 图片预览/上传弹窗 -->
    <a-modal v-model:open="previewVisible" title="活动封面" :footer="null">
      <div class="preview-container">
        <img v-if="previewImage" :src="previewImage" alt="预览" class="preview-image" />
        <a-empty v-else description="暂无封面" />
      </div>
      <a-divider />
      <a-upload :before-upload="handleUpload" :show-upload-list="false">
        <a-button icon="Upload">上传封面</a-button>
      </a-upload>
    </a-modal>

    <!-- 编辑海报弹窗 -->
    <a-modal v-model:open="posterVisible" title="编辑海报" width="900px" :footer="null">
      <div v-if="currentRecord" class="poster-editor">
        <div class="poster-preview">
          <img v-if="posterUrl || currentRecord.poster_url" :src="posterUrl || currentRecord.poster_url" alt="海报预览" />
          <div v-else class="poster-placeholder">
            <PictureOutlined style="font-size: 48px; color: #d9d9d9;" />
            <p>暂无海报</p>
          </div>
        </div>
        <a-divider />
        <div class="poster-info">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="活动名称">{{ currentRecord.title }}</a-descriptions-item>
            <a-descriptions-item label="活动编号">{{ currentRecord.campaign_id }}</a-descriptions-item>
            <a-descriptions-item label="收款商户">{{ currentRecord.merchant_name }}</a-descriptions-item>
            <a-descriptions-item label="活动时间">{{ formatDateTime(currentRecord.start_time) }} ~ {{ formatDateTime(currentRecord.end_time) }}</a-descriptions-item>
          </a-descriptions>
        </div>
        <a-divider />
        <div class="poster-upload">
          <p>上传新海报：</p>
          <a-upload :before-upload="handlePosterUpload" :show-upload-list="false" list-type="picture">
            <a-button icon="Upload">选择图片</a-button>
          </a-upload>
          <p class="upload-tip">支持 JPG、PNG 格式，建议尺寸 750x1334 像素</p>
        </div>
      </div>
    </a-modal>

    <!-- 数据统计弹窗 -->
    <a-modal v-model:open="statsModalVisible" title="数据统计" width="800px" :footer="null">
      <div v-if="currentRecord">
        <a-descriptions title="活动信息" bordered :column="2">
          <a-descriptions-item label="活动名称">{{ currentRecord.title }}</a-descriptions-item>
          <a-descriptions-item label="活动状态">
            <a-tag :color="getStatusColor(currentRecord.status)">{{ getStatusText(currentRecord.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="浏览量">{{ currentRecord.views }}</a-descriptions-item>
          <a-descriptions-item label="参与人数">{{ currentRecord.participates }}</a-descriptions-item>
          <a-descriptions-item label="报名人数">{{ currentRecord.registrations }}</a-descriptions-item>
          <a-descriptions-item label="支付人数">{{ currentRecord.payments }}</a-descriptions-item>
          <a-descriptions-item label="收款金额">{{ currentRecord.revenue?.toFixed(2) || '0.00' }}</a-descriptions-item>
          <a-descriptions-item label="余额">{{ currentRecord.balance?.toFixed(2) || '0.00' }}</a-descriptions-item>
        </a-descriptions>
        <a-divider>数据趋势</a-divider>
        <div style="height: 300px; display: flex; align-items: center; justify-content: center; background: #fafafa; border-radius: 8px;">
          <a-empty description="图表功能开发中..." />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, PictureOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'

const tableData = ref([])
const loading = ref(false)
const selectedRowKeys = ref([])
const searchForm = reactive({ title: '', merchant_id: '', status: '' })
const pagination = reactive({ current: 1, pageSize: 20, total: 0, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` })

const rowSelection = {
  selectedRowKeys,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRecord.value = rows.length > 0 ? rows[0] : null
  }
}

const handleTableChange = (pagination, filters, sorter, extra) => {
  if (extra.action === 'selectRow' && extra.selectedRows.length > 0) {
    selectedRecord.value = extra.selectedRows[0]
  }
}

// 弹窗相关
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const batchModalVisible = ref(false)
const activeOtherTab = ref('share')

const form = reactive({
  id: null,
  title: '',
  merchant_id: '',
  start_time: null,
  end_time: null,
  verify_end_time: null,
  music_url: '',
  image_type: 'single',
  carousel_height: 1200,
  virtual_views: 0,
  virtual_participates: 0,
  virtual_shares: 0,
  virtual_registrations: 0,
  btn1_text: '',
  btn1_amount: 0,
  btn2_text: '',
  btn2_amount: 0,
  btn3_text: '',
  btn3_amount: 0,
  shop_name: '',
  shop_phone: '',
  shop_address: '',
  latitude: '',
  longitude: '',
  nav_bg_color: '#FFFFFF',
  share_title: '',
  share_desc: '',
  share_copywriting: '',
  enable_scroll_notice: false,
  countdown_font_color: '#f6f5f5',
  countdown_bg_color: '#0b0101',
  select_color: '#ff8c00',
  single_condition: 'close',
  min_org_count: 1,
  max_org_count: 3,
  min_course_count: 3,
  max_course_count: 3,
  fields: [
    { type: 'text', label: '姓名：', placeholder: '请输入姓名', options: '' },
    { type: 'phone', label: '电话：', placeholder: '请输入电话', options: '' },
    { type: 'radio', label: '新老客：', placeholder: '请选择新老客', options: '新顾客|老顾客' }
  ],
  end_text: '',
  end_image: '',
  rich_content: '',
  force_commission: false,
  distribution_ranking: false,
  distribution_channel: 'wechat',
  commission_total: 0,
  commission_desc: '',
  customer_distribution: 'close',
  employee_distribution: 'close',
  employee_trace_reward: false,
  invite_redpacket_enabled: false,
  redpacket_total: 0,
  redpacket_daily_limit: 0,
  redpacket_per_user_limit: 1,
  browse_seconds: 5,
  redpacket_min_amount: 0.01,
  redpacket_max_amount: 1.00,
  redpacket_restrict_regions: '',
  show_complaint_phone: false,
  enable_consult_input: false,
  support_phone: '',
  support_website: '',
  complaint_phone: '',
  group_purchase_mode: 'close',
  allow_group_buy: false,
  enable_group_purchase: false,
  nearby_group: false,
  unlimited_members: false,
  team_ranking: false,
  phone_adjust_group: false,
  max_groups_per_user: 1,
  group_member_count: 2,
  enable_danmu: false,
  enable_verification: false,
  virtual_avatar: false,
  fans_ranking: false,
  payment_tip: false,
  promotion_list: false,
  invitation_list: false,
  ad_list: false,
  latest_orders: false,
  mobile_refund: false,
  mobile_modify_order: false,
  danmu_lines: 2,
  merchant_rate: 0.006,
  verification_times: 1,
  bottom_tip_label: '',
  payment_popup_image: '',
  banned_keywords: '',
  restricted_areas: '',
  splash_screen_status: 'disabled',
  splash_screen_copy_content: '',
  payment_tip_content: ''
})

const fieldColumns = [
  { title: '类型', key: 'type', width: 120 },
  { title: '标签', key: 'label', width: 120 },
  { title: '提示', key: 'placeholder', width: 150 },
  { title: '内容', key: 'options', width: 150 },
  { title: '操作', key: 'action', width: 120 }
]

const addField = () => {
  form.fields.push({ type: 'text', label: '', placeholder: '', options: '' })
}

const removeField = (index) => {
  form.fields.splice(index, 1)
}

const moveField = (index, direction) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= form.fields.length) return
  const temp = form.fields[index]
  form.fields[index] = form.fields[newIndex]
  form.fields[newIndex] = temp
}

const handleBatchDelete = () => {
  batchModalVisible.value = true
}

const confirmBatchDelete = () => {
  message.success(`已删除 ${selectedRowKeys.value.length} 项`)
  batchModalVisible.value = false
}
const rules = {
  title: [{ required: true, message: '请输入活动名称' }],
  merchant_name: [{ required: true, message: '请选择收款商户' }],
  start_time: [{ required: true, message: '请选择开始时间' }],
  end_time: [{ required: true, message: '请选择结束时间' }],
  budget: [{ required: true, message: '请输入活动预算' }]
}

// 图片预览
const previewVisible = ref(false)
const previewImage = ref('')
const currentEditRecord = ref(null)

// 海报编辑
const posterVisible = ref(false)
const posterUrl = ref('')
const currentPosterRecord = ref(null)

// 统计弹窗
const statsModalVisible = ref(false)
const currentRecord = ref(null)
const selectedRecord = ref(null)

// 表格列定义
const columns = [
  { title: '首图', key: 'coverImage', width: 60, slots: { customRender: 'coverImage' } },
  { title: '活动状态', key: 'status', width: 120, slots: { customRender: 'status' } },
  { title: '活动信息', key: 'info', width: 200, slots: { customRender: 'info' } },
  { title: '活动时间', key: 'time', width: 180, slots: { customRender: 'time' } },
  { title: '基本数据', key: 'basicData', width: 180, slots: { customRender: 'basicData' } },
  { title: '结算数据', key: 'settleData', width: 250, slots: { customRender: 'settleData' } },
  { title: '其他功能', key: 'otherFunc', width: 150, slots: { customRender: 'otherFunc' } },
  { title: '解冻时间', key: 'unfreezeTime', width: 100, slots: { customRender: 'unfreezeTime' } },
  { title: '操作', key: 'action', width: 200, fixed: 'right', slots: { customRender: 'action' } }
]

// 计算解冻时间（结束时间+7天）
const calculateUnfreezeTime = (endTime) => {
  return dayjs(endTime).add(7, 'day').format('YYYY-MM-DD HH:mm:ss')
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        cover_image: '',
        poster_url: '',
        campaign_id: 'A2026011160273',
        title: '瑞颜阁美容养生会所 制定美丽 专业呵护 VIP内购会限量秒杀',
        register_url: 'https://example.com/register/A2026011160273',
        merchant_name: '双美拓客1718143771',
        start_time: '2026-01-12 00:00:00',
        end_time: '2026-01-18 05:59:59',
        status: 'ended',
        views: 449,
        participates: 98,
        registrations: 48,
        payments: 44,
        offline: 0,
        revenue: 13156.00,
        fee: 78.93,
        commission: 650,
        redPacket: 0,
        withdraw: 0,
        balance: 12427.07,
        unfreeze_status: 'pending',
        unfreeze_time: calculateUnfreezeTime('2026-01-18 05:59:59')
      },
      {
        id: 2,
        cover_image: '',
        poster_url: '',
        campaign_id: 'A2026010772128',
        title: 'U·娜调肤会所年终答谢会福利299元限时秒杀上万元福利大礼',
        register_url: 'https://example.com/register/A2026010772128',
        merchant_name: '双美拓客1718143771',
        start_time: '2026-01-08 00:00:00',
        end_time: '2026-01-14 23:59:59',
        status: 'ended',
        views: 14,
        participates: 5,
        registrations: 0,
        payments: 0,
        offline: 0,
        revenue: 0.00,
        fee: 0.00,
        commission: 0,
        redPacket: 0,
        withdraw: 0,
        balance: 0.00,
        unfreeze_status: 'pending',
        unfreeze_time: calculateUnfreezeTime('2026-01-14 23:59:59')
      },
      {
        id: 3,
        cover_image: '',
        poster_url: '',
        campaign_id: 'A2025121357460',
        title: '【阳明医美】冬季宠粉盛典 680元撬动万元美丽',
        register_url: 'https://example.com/register/A2025121357460',
        merchant_name: '双美拓客1718143771',
        start_time: '2025-12-14 00:00:00',
        end_time: '2025-12-20 14:59:59',
        status: 'ended',
        views: 577,
        participates: 93,
        registrations: 49,
        payments: 44,
        offline: 0,
        revenue: 29920.00,
        fee: 179.52,
        commission: 2200,
        redPacket: 0,
        withdraw: 0,
        balance: 27540.48,
        unfreeze_status: 'pending',
        unfreeze_time: calculateUnfreezeTime('2025-12-20 14:59:59')
      },
      {
        id: 4,
        cover_image: '',
        poster_url: '',
        campaign_id: 'A2025121134583',
        title: '【叶子.禾壹净】 双12. 爱你有我. 闺蜜同行',
        register_url: 'https://example.com/register/A2025121134583',
        merchant_name: '双美拓客1718143771',
        start_time: '2025-12-12 00:00:00',
        end_time: '2025-12-20 19:59:59',
        status: 'ended',
        views: 934,
        participates: 148,
        registrations: 119,
        payments: 114,
        offline: 0,
        revenue: 34086.00,
        fee: 204.51,
        commission: 3420,
        redPacket: 0,
        withdraw: 0,
        balance: 30461.49,
        unfreeze_status: 'pending',
        unfreeze_time: calculateUnfreezeTime('2025-12-20 19:59:59')
      },
      {
        id: 5,
        cover_image: '',
        poster_url: '',
        campaign_id: 'A2025121156402',
        title: '胭脂堂 感恩回馈 限时秒杀 VIP内购会 超值福利',
        register_url: 'https://example.com/register/A2025121156402',
        merchant_name: '双美拓客1718143771',
        start_time: '2025-12-12 00:00:00',
        end_time: '2025-12-18 06:59:59',
        status: 'ended',
        views: 214,
        participates: 63,
        registrations: 21,
        payments: 18,
        offline: 0,
        revenue: 5382.00,
        fee: 32.29,
        commission: 570,
        redPacket: 0,
        withdraw: 0,
        balance: 4779.71,
        unfreeze_status: 'unfrozen',
        unfreeze_time: null
      }
    ]
    pagination.total = 5
    loading.value = false
  }, 500)
}

const handleSearch = () => { loadData() }
const handleReset = () => { searchForm.title = ''; searchForm.merchant_id = ''; searchForm.status = ''; loadData() }

const getStatusColor = (s) => ({ draft: 'orange', active: 'green', paused: 'volcano', ended: 'red' }[s] || 'default')
const getStatusText = (s) => ({ draft: '未开始', active: '进行中', paused: '已暂停', ended: '已结束' }[s] || s)
const formatDateTime = (d) => d ? dayjs(d).format('YYYY-MM-DD HH:mm:ss') : ''

// 图片预览
const handlePreview = (record) => {
  currentEditRecord.value = record
  previewImage.value = record.cover_image || ''
  previewVisible.value = true
}

// 图片上传
const handleUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImage.value = e.target.result
    if (currentEditRecord.value) {
      currentEditRecord.value.cover_image = e.target.result
    }
  }
  reader.readAsDataURL(file)
  return false
}

// 编辑海报
const handleEditPoster = (record) => {
  currentPosterRecord.value = record
  posterUrl.value = record.poster_url || ''
  posterVisible.value = true
}

// 海报上传
const handlePosterUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    posterUrl.value = e.target.result
    if (currentPosterRecord.value) {
      currentPosterRecord.value.poster_url = e.target.result
    }
    message.success('海报上传成功')
  }
  reader.readAsDataURL(file)
  return false
}

// 复制注册链接
const handleCopyLink = (record) => {
  const url = record.register_url || `https://example.com/register/${record.campaign_id}`
  navigator.clipboard.writeText(url).then(() => {
    message.success('注册链接已复制到剪贴板')
  }).catch(() => {
    message.error('复制失败，请手动复制')
  })
}

// 切换激活状态
const handleToggleStatus = (record) => {
  const newStatus = record.status === 'active' ? 'paused' : 'active'
  record.status = newStatus
  message.success(newStatus === 'active' ? '已激活' : '已禁用')
}

// 解冻
const handleUnfreeze = (record) => {
  if (record.status !== 'ended') {
    message.warning('只能对已结束的活动进行解冻')
    return
  }
  if (record.unfreeze_status === 'unfrozen') {
    message.info('该活动已经解冻')
    return
  }
  Modal.confirm({
    title: '确认解冻',
    content: `确定要解冻活动"${record.title}"的分账吗？解冻后余额将可提现。`,
    okText: '确认解冻',
    cancelText: '取消',
    onOk: () => {
      record.unfreeze_status = 'unfrozen'
      record.unfreeze_time = null
      message.success('解冻成功，余额已可提现')
    }
  })
}

const showCreateModal = () => {
  isEdit.value = false
  Object.assign(form, { id: null, title: '', merchant_name: '', start_time: null, end_time: null, budget: 0, status: 'draft', description: '' })
  modalVisible.value = true
}

const handleEdit = (record) => {
  isEdit.value = true
  Object.assign(form, {
    id: record.id,
    title: record.title,
    merchant_name: record.merchant_name,
    start_time: dayjs(record.start_time),
    end_time: dayjs(record.end_time),
    budget: record.budget || 0,
    status: record.status,
    description: record.description || ''
  })
  modalVisible.value = true
}

const handleSubmit = async () => {
  modalLoading.value = true
  setTimeout(() => {
    modalLoading.value = false
    modalVisible.value = false
    message.success(isEdit.value ? '活动更新成功' : '活动创建成功')
    loadData()
  }, 1000)
}

const handleViewData = (record) => {
  currentRecord.value = record
  statsModalVisible.value = true
}

// 导出Excel
const handleExport = () => {
  const exportData = tableData.value.map(item => ({
    '活动编号': item.campaign_id,
    '活动标题': item.title,
    '收款商户': item.merchant_name,
    '活动状态': getStatusText(item.status),
    '开始时间': formatDateTime(item.start_time),
    '结束时间': formatDateTime(item.end_time),
    '浏览': item.views,
    '参与': item.participates,
    '报名': item.registrations,
    '支付': item.payments,
    '线下': item.offline,
    '收款': item.revenue,
    '手续费': item.fee,
    '佣金': item.commission,
    '红包': item.redPacket,
    '提现': item.withdraw,
    '余额': item.balance,
    '解冻时间': formatDateTime(item.unfreeze_time)
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '活动列表')
  XLSX.writeFile(wb, `活动列表_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`)
  message.success('导出成功')
}

onMounted(() => { loadData() })
</script>

<style scoped>
.campaign-page { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h2 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
.page-header p { color: #999; font-size: 14px; }
.search-card { margin-bottom: 16px; }

/* 表格单元格样式 */
.cover-image { width: 60px; height: 60px; border-radius: 4px; overflow: hidden; cursor: pointer; }
.cover-image img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #d9d9d9; font-size: 20px; }

.status-cell { font-size: 12px; }
.campaign-id { margin-bottom: 4px; }

.info-cell { font-size: 12px; }
.info-cell .campaign-title { font-weight: 500; margin-bottom: 4px; line-height: 1.4; }
.info-cell .register-link { margin-bottom: 2px; }
.info-cell .merchant-name { color: #666; }

.time-cell { font-size: 12px; }
.time-cell > div { margin-bottom: 2px; }
.time-status { color: #666; }

.data-row { display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; }
.data-row span { white-space: nowrap; }

.other-func-cell { display: flex; flex-direction: column; gap: 4px; }
.other-func-cell .func-row { display: flex; gap: 8px; }

.unfreeze-time { font-size: 12px; color: #666; }

/* 页面标题按钮布局 */
.header-actions {
  display: flex;
  gap: 12px;
}

/* 操作列样式 */
.action-cell {
  display: flex;
  gap: 4px;
}

.action-cell :deep(.ant-btn) {
  flex-shrink: 0;
}

/* 表单样式 */
.upload-box {
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-box:hover {
  border-color: #1890ff;
}

.mt-8 {
  margin-top: 8px;
}

.field-list {
  border: 1px solid #f0f0f0;
  padding: 16px;
  border-radius: 4px;
}

.preview-container { text-align: center; }
.preview-image { max-width: 100%; max-height: 400px; }

.poster-editor { padding: 10px 0; }
.poster-preview { text-align: center; min-height: 200px; display: flex; align-items: center; justify-content: center; }
.poster-preview img { max-width: 100%; max-height: 400px; border-radius: 8px; }
.poster-placeholder { padding: 40px; background: #fafafa; border-radius: 8px; text-align: center; color: #999; }
.poster-info { margin: 16px 0; }
.poster-upload { margin-top: 16px; }
.poster-upload p { margin-bottom: 8px; color: #666; }
.upload-tip { font-size: 12px; color: #999; margin-top: 8px; }
</style>
