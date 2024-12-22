<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12">
        <el-form ref="form" :model="form" label-width="120px" style="padding-top: 10vh;">
          <el-form-item label="导演名称" required>
            <el-input
              v-model="form.directorName"
              placeholder="请输入导演名称"
              style="width: 80%;"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="searchByDirector">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span="1">
        <el-divider direction="vertical" />
      </el-col>

      <el-col :span="10">
        <el-tabs v-model="activeName">
          <el-tab-pane label="查询结果" name="first">
            <p v-if="hasResult">该导演共有 {{ movieNumber }} 部电影</p>
            <el-table
              v-loading="loading"
              :data="movieData"
              style="width: 100%"
              height="460"
              border
              stripe
            >
              <el-table-column prop="title" label="电影名称" />
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
  name: 'DirectorQuery',
  data() {
    return {
      form: {
        directorName: ''
      },
      activeName: 'first',
      loading: false,
      hasResult: false,
      movieData: [],
      movieNumber: 0,
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
    searchByDirector() {
      if (!this.form.directorName) {
        this.$message.warning('请输入导演名称')
        return
      }

      this.loading = true
      this.hasResult = true

      const axios = require('axios')

      axios.get(`${this.BASE_URL}/director-movies`, {
        params: {
          directorName: this.form.directorName
        }
      })
        .then(response => {
          console.log('Neo4j response:', response.data)
          if (response.data && response.data.status === 'success') {
            // 将电影名称数组转换为表格数据格式
            this.movieData = response.data.movies.map(movieName => ({
              title: movieName
            }))
            this.movieNumber = response.data.movieCount

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
          console.error('Error fetching director data:', error)
          this.$message.error('查询失败，请稍后重试')
          this.loading = false
        })

        axios.get(`${this.MYSQL_BASE_URL}/movies/director/${this.form.directorName}`)
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
