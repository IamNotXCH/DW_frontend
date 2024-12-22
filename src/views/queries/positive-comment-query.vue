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
        }
      }
    },
    methods: {
      fetchData() {
        this.loading = true
        this.hasResult = true
  
        axios.get(`http://localhost:8848/neo4j/movie/movies-with-positive-reviews`)
          .then(response => {
            if (response.data) {
              const movies = response.data.moviesWithPositiveReviews || []
              if (!Array.isArray(movies)) {
                this.$message.error('返回的电影数据格式不正确')
                this.loading = false
                return
              }
  
              this.tableData = movies
                .slice(0, 100)
                .map(movie => ({
                  title: movie.MovieName || ''
                }))
              
              this.totalMovies = movies.length
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
            this.totalMovies = 0
            this.queryTime = 0
            this.chartData.rows = []
          })
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