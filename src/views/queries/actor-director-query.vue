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
              <p v-if="hasResult">共找到 {{ pairNumber }} 组常合作的导演演员组合</p>
              <el-table
                v-loading="loading"
                :data="pairData"
                style="width: 100%"
                height="460"
                border
                stripe
              >
                <el-table-column prop="directorName" label="导演名字" />
                <el-table-column prop="actorName" label="演员名字" />
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
  import axios from 'axios'

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
        BASE_URL: 'http://localhost:8848'
      }
    },
    methods: {
      searchCoActors() {
        this.loading = true
        this.hasResult = true
  
        axios.get(`${this.BASE_URL}/director-actor-collaborations`)
          .then(response => {
            console.log('Neo4j response:', response.data)
            if (response.data) {
              // 转换数据格式
              this.pairData = response.data.collaborations.map(pair => ({
                directorName: pair.directorName,
                actorName: pair.actorName,
                count: pair.movieCount
              }))
              
             
              this.pairNumber = response.data.collaborations.length
              
              if (response.data.time) {
                this.chartData.rows = [
                  { '数据库': 'Neo4j', '查询时间': response.data.time }
                ]
              }
            }else{
              this.$message.error('查询失败')
            }
            this.loading = false
          })
          .catch(error => {
            console.error('Error fetching co-actors data:', error)
            this.$message.error('查询失败，请稍后重试')
            this.loading = false
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