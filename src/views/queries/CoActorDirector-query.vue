<template>
    <div class="app-container">
      <el-row>
        <el-col :span="12">
          <el-form ref="form" :model="queryForm" label-width="120px" style="padding-top: 10vh;">
            <el-form-item label="电影类型" required>
              <el-input
                v-model="queryForm.category"
                placeholder="请输入电影类型"
                style="width: 80%;"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="fetchData">查询</el-button>
            </el-form-item>
          </el-form>
        </el-col>

        <el-col :span="1">
          <el-divider direction="vertical" />
        </el-col>

        <el-col :span="10">
          <el-tabs v-model="activeName">
            <el-tab-pane label="查询结果" name="first">
              <p v-if="hasResult">共有 {{ totalPairs }} 组演员组合</p>
              <el-row style="margin-top: 20px;">
                <el-col :span="24">
                  <el-table
                    v-loading="loading"
                    :data="tableData"
                    style="width: 100%"
                    :height="'60vh'"
                    border
                  >
                    <el-table-column
                      prop="actor1"
                      label="演员1"
                      width="180"
                    />
                    <el-table-column
                      prop="actor2"
                      label="演员2"
                      width="180"
                    />
                    <el-table-column
                      prop="comments"
                      label="评论数"
                      width="100"
                    />
                  </el-table>
                </el-col>
              </el-row>
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
        queryForm: {
          category: ''
        },
        loading: false,
        hasResult: false,
        tableData: [],
        totalPairs: 0,
        queryTime: 0,
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
            text: '时间查询性能对比',
            subtext: '不同数据库的查询响应时间对比'
          }
        },
        MYSQL_BASE_URL:'http://localhost:3001/api'

      }
    },
    methods: {
      fetchData() {
        if (!this.queryForm.category) {
          this.$message.warning('请输入电影类型')
          return
        }

        this.loading = true
        this.hasResult = true

        axios.get(`http://localhost:8848/neo4j/movie/most-commented-actor-pairs`, {
          params: {
            type: this.queryForm.category
          }
        })
          .then(response => {
            if (response.data && response.data.status === 'success') {
              const pairs = response.data.mostCommentedActorPairs || []
              if (!Array.isArray(pairs)) {
                this.$message.error('返回的数据格式不正确')
                this.loading = false
                return
              }

              this.tableData = pairs.map(pair => ({
                actor1: pair.ActorPair[0],
                actor2: pair.ActorPair[1],
                comments: pair.TotalComments
              }))

              this.totalPairs = pairs.length
              this.queryTime = response.data.time || 0

              if (response.data.time) {
                this.chartData.rows = [
                  { '数据库': 'Neo4j', '查询时间': response.data.time }
                ]
              }

              this.$message.success('查询成功')
            } else {
              this.$message.error('返回数据格式不正确')
            }
            this.loading = false
          })
          .catch(error => {
            console.error('Error fetching data:', error)
            this.$message.error('获取数据失败：' + (error.message || '未知错误'))
            this.loading = false
            this.tableData = []
            this.totalPairs = 0
            this.queryTime = 0
            this.chartData.rows = []
          })

          axios.get(`${this.MYSQL_BASE_URL}/actors/popular/collaboration`,{
            params:{
              limit:1,
              type:this.queryForm.category
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
