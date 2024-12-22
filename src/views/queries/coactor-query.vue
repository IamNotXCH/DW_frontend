<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12">
        <div style="padding-top: 10vh; text-align: center;">
          <el-alert
            title="本次查询无需输入任何参数"
            type="info"
            description="点击查询按钮即可获取常合作的演员组合"
            show-icon
            :closable="false"
            style="margin-bottom: 20px;"
          />
          <el-button type="primary" @click="searchCoActors" :loading="loading">查询</el-button>
        </div>
      </el-col>

      <el-col :span="1">
        <el-divider direction="vertical" />
      </el-col>

      <el-col :span="10">
        <el-tabs v-model="activeName">
          <el-tab-pane label="查询结果" name="first">
            <p v-if="hasResult">共找到 {{ pairNumber }} 组常合作的演员组合</p>
            <el-table
              v-loading="loading"
              :data="pairData"
              style="width: 100%"
              height="460"
              border
              stripe
            >
              <el-table-column prop="actorA" label="演员A" />
              <el-table-column prop="actorB" label="演员B" />
              <el-table-column prop="count" label="合作次数" width="100" sortable />
            </el-table>
          </el-tab-pane>

          <el-tab-pane label="速度对比" name="second" :disabled="!hasResult">
            <ve-histogram
              :data="chartData"
              :settings="chartSettings"
              :extend="chartExtend"
              width="38vw"
            />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'CoActorQuery',
  data() {
    return {
      activeName: 'first',
      loading: false,
      hasResult: false,
      pairData: [],
      pairNumber: 0,
      chartData: {
        columns: ['数据库', '查询时间'],
        rows: []
      },
      chartSettings: {
        labelMap: {
          '数据库': '数据库类型',
          '查询时间': '耗时(ms)'
        }
      },
      chartExtend: {
        title: {
          text: '查询性能对比',
          subtext: '不同数据库的查询响应时间对比'
        }
      },
      BASE_URL: 'http://localhost:8848',
      MYSQL_BASE_URL:'http://localhost:3001/api'
    }
  },
  methods: {
    searchCoActors() {
      this.loading = true
      this.hasResult = true

      const axios = require('axios')

      axios.get(`${this.BASE_URL}/actor-collaboration`)
        .then(response => {
          console.log('Neo4j response:', response.data)
          if (response.data && response.data.status === 'success') {
            // 转换数据格式
            this.pairData = response.data.Collaborations.map(pair => ({
              actorA: pair.Actor1,
              actorB: pair.Actor2,
              count: pair.MovieCount
            }))

            // 获取唯一的演员组合数量（去除重复的组合）
            const uniquePairs = new Set()
            response.data.Collaborations.forEach(pair => {
              const actors = [pair.Actor1, pair.Actor2].sort().join('-')
              uniquePairs.add(actors)
            })
            this.pairNumber = uniquePairs.size

            if (response.data.time) {
              this.chartData.rows = [
                { '数据库': 'Neo4j', '查询时间': response.data.time }
              ]
            }
          } else {
            this.$message.error('查询失败')
          }
          this.loading = false
        })
        .catch(error => {
          console.error('Error fetching co-actors data:', error)
          this.$message.error('查询失败，请稍后重试')
          this.loading = false
        })

        axios.get(`${this.MYSQL_BASE_URL}/actors/collaboration`,{
            params:{
              limit:1000000
            }
        })
        .then(response => {
          console.log('API 返回的查询时间:', response.data)
          console.log('API返回的查询时间',response.data.queryTime)

          this.chartData.rows.push(
              { '数据库': 'MYSQL', '查询时间': response.data.queryTime }
            )

        })
        .catch(error => {
          console.error('请求新接口出错:', error)
          this.$message.error('获取速度对比数据失败')
        })
    }
  }
}
</script>

<style scoped>
.el-divider--vertical {
  height: 75vh;
}
</style>
