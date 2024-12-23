<template>
    <div class="app-container">
      <el-row>
        <el-col :span="12">
          <div style="padding-top: 10vh; text-align: center;">
            <h2>积极评论电影查询</h2>
            <el-button type="primary" @click="fetchData" :loading="loading">
              刷新数据
            </el-button>
          </div>
        </el-col>

        <el-col :span="1">
          <el-divider direction="vertical" />
        </el-col>

        <el-col :span="10">
          <el-tabs v-model="activeName">
            <el-tab-pane label="查询结果" name="first">
              <p v-if="hasResult">共有 {{ totalMovies }} 个电影</p>
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
                      prop="title"
                      label="电影名称"
                      width="450"
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
    name: 'MoviePositiveReviewQuery',
    data() {
      return {
        loading: false,
        hasResult: false,
        tableData: [],
        totalMovies: 0,
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
        MYSQL_BASE_URL:'http://localhost:3001/api',
        mysqlTime: 0,
        neo4jTime: 0
      }
    },
    methods: {
      fetchData() {
        this.loading = true
        this.hasResult = true

        // 获取 Neo4j 的查询时间
        axios.get(`http://localhost:8848/neo4j/movie/movies-with-positive-reviews`)
          .then(response => {
            this.neo4jTime = response.data.time
            this.updateChartData()
          })
          .catch(error => {
            console.error('Neo4j请求出错:', error)
            this.$message.error('获取Neo4j查询时间失败')
          })

        // 获取 MySQL 的数据和查询时间
        axios.get(`${this.MYSQL_BASE_URL}/movies/positive-reviews`, {
          params: {
            limit: 1000000
          }
        })
          .then(response => {
            console.log('API 返回的查询时间:', response.data)
            console.log('API返回的查询时间', response.data.queryTime)
            
            this.mysqlTime = parseInt(response.data.queryTime.replace('ms', '')) || 0
            
            if (response.data && response.data.data) {
              this.tableData = response.data.data.map(movieName => ({
                title: movieName
              }))
              this.totalMovies = response.data.data.length
            }

            this.updateChartData()

            this.loading = false
            this.hasResult = true
            this.$message.success('查询成功')
          })
          .catch(error => {
            console.error('MySQL请求出错:', error)
            this.$message.error('获取数据失败')
            this.loading = false
            this.tableData = []
            this.totalMovies = 0
            this.chartData.rows = []
          })
      },
      updateChartData() {
        this.chartData.rows = [
          { '数据库': 'Neo4j', '查询时间': this.neo4jTime },
          { '数据库': 'MYSQL', '查询时间': this.mysqlTime }
        ]
      }
    },
    created() {
      this.fetchData()
    }
  }
  </script>

  <style scoped>
  .el-divider--vertical {
    height: 75vh;
  }
  </style>
