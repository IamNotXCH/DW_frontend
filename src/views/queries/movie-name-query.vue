<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12">
        <el-form ref="form" :model="form" label-width="120px" style="padding-top: 10vh;">
          <el-form-item label="电影名称" required>
            <el-input
              v-model="form.movieName"
              placeholder="请输入电影名称"
              style="width: 80%;"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="searchByName">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      
      <el-col :span="1">
        <el-divider direction="vertical" />
      </el-col>
      
      <el-col :span="10">
        <el-tabs v-model="activeName">
          <el-tab-pane label="查询结果" name="first">
            <p v-if="hasResult">共有 {{ movieNumber }} 个版本</p>
            <el-table
              v-loading="loading"
              :data="movieData"
              style="width: 100%"
              height="460"
              border
              stripe
            >
              <el-table-column prop="title" label="电影名称" width="300" />
              <el-table-column prop="score" label="评分" width="100" />
              <el-table-column prop="time" label="上映时间" />
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
export default {
  name: 'MovieNameQuery',
  data() {
    return {
      form: {
        movieName: ''
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
          text: '时间查询性能对比',
          subtext: '不同数据库的查询响应时间对比'
        }
      },
      BASE_URL: 'http://localhost:8848',
      MYSQL_BASE_URL:'http://localhost:3001/api',
      mysqlTime: 0,
      neo4jTime: 0
    }
  },
  methods: {
    searchByName() {
      if (!this.form.movieName) {
        this.$message.warning('请输入电影名称')
        return
      }

      this.loading = true
      this.hasResult = true

      const axios = require('axios')
      
      axios.get(`${this.BASE_URL}/neo4j/movie/movie-version-count`, {
        params: { 
          movieName: this.form.movieName
        }
      })
        .then(response => {
          console.log('Neo4j response:', response.data)
          if (response.data && response.data.status === 'success') {
            this.movieData = response.data.versions.map(movie => ({
              title: movie.MovieName,
              time: movie.MovieReleaseTime ? 
                `${movie.MovieReleaseTime.replace(/(\d+)\/(\d+)\/(\d+)/, '$1年$2月$3日')}` : 
                '-',
              score: movie.MovieGrade
            }))
            this.movieNumber = response.data.VersionCount
            this.neo4jTime = response.data.time
            this.updateChartData()
          } else {
            this.$message.error('查询失败')
          }
          this.loading = false
        })
        .catch(error => {
          console.error('Error fetching Neo4j data:', error)
          this.$message.error('查询失败，请稍后重试')
          this.loading = false
        })
      

      axios.get(`${this.MYSQL_BASE_URL}/movies/versions`, {
        params: { 
          name: this.form.movieName
        }
      })
      .then(response => {
        console.log('API 返回的查询时间:', response.data)
        console.log('API返回的查询时间',response.data.queryTime)
        this.mysqlTime = parseInt(response.data.queryTime.replace('ms', '')) || 0
        this.updateChartData()
      })
      .catch(error => {
        console.error('请求新接口出错:', error)
        this.$message.error('获取速度对比数据失败')
      })
      
    },

    updateChartData() {
      const neo4jTimeNum = Number(this.neo4jTime)
      const mysqlTimeNum = Number(this.mysqlTime)
      this.chartData.rows = [
        { '数据库': 'Neo4j', '查询时间': neo4jTimeNum },
        { '数据库': 'MYSQL', '查询时间': mysqlTimeNum }
      ] 
    }
  }
}
</script>

<style scoped>
.el-divider--vertical {
  height: 75vh;
}
</style> 