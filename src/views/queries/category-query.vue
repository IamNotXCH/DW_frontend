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
            <p v-if="hasResult">共有 {{ totalMovies }} 个版本</p>
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
                    width="300"
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
  name: 'MovieNameQuery',
  data() {
    return {
      queryForm: {
        category: ''
      },
      activeName: 'first',
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
      BASE_URL: 'http://localhost:8848'
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
      const startTime = Date.now()

      axios.get(`http://localhost:8848/neo4j/movie/movies-by-category`, {
        params: {
          categoryName: this.queryForm.category
        }
      })
        .then(response => {
          if (response.data) {
            this.tableData = response.data.movies.map(movieName => ({
              title: movieName
            }))
            
            this.totalMovies = response.data.MovieCount || 0

            this.queryTime = response.data.time || 0
            
            this.$message.success('查询成功')
          } else {
            this.$message.error('返回数据格式不正确')
          }
          if (response.data.time) {
              this.chartData.rows = [
                { '数据库': 'Neo4j', '查询时间': response.data.time }
              ]
          }
          this.loading = false
        })
        .catch(error => {
          console.error('Error fetching data:', error)
          this.$message.error('获取数据失败：' + (error.message || '未知错误'))
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