<template>
  <div class="app-container">
    <el-row type="flex" justify="center">
      <el-col :span="20">
        <div class="content-wrapper">
          <h2 class="query-title">我们找到多少哈利波特系列的电影？这个电影有多少版本？有多少网页？哈利波特第一部我们合并了多少个不同的网页？</h2>
          
          <div class="button-wrapper">
            <el-button 
              type="primary" 
              :loading="loading"
              @click="fetchData"
            >
              查询
            </el-button>
          </div>

          <div v-if="hasResult" class="result-wrapper">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-card class="result-card">
                  <div class="result-number">{{ movieDistinctCount }}</div>
                  <div class="result-label">不同电影数量</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="result-card">
                  <div class="result-number">{{ movieCount }}</div>
                  <div class="result-label">总电影数量</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="result-card">
                  <div class="result-number">{{ versionDistinctCount }}</div>
                  <div class="result-label">不同版本数量</div>
                </el-card>
              </el-col>
              <el-col :span="6">
                <el-card class="result-card">
                  <div class="result-number">{{ versionCount }}</div>
                  <div class="result-label">总版本数量</div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 添加速度对比图表 -->
            <el-row style="margin-top: 40px;">
              <el-col :span="24">
                <el-card>
                  <div slot="header">
                    <span>查询性能对比</span>
                  </div>
                  <ve-histogram
                    :data="chartData"
                    :settings="chartSettings"
                    :extend="chartExtend"
                    height="400px"
                  />
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MovieTrace',
  data() {
    return {
      loading: false,
      hasResult: false,
      movieDistinctCount: 0,
      movieCount: 0,
      versionDistinctCount: 0,
      versionCount: 0,
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
      neo4jTime: 0,
      mysqlTime: 0,
      hiveTime: 0
    }
  },
  methods: {
    fetchData() {
      this.loading = true

      // Neo4j 查询
      axios.get('http://localhost:8848/neo4j/movie/harry-potter-movie-info')
        .then(response => {
          if (response.data) {
            this.movieDistinctCount = response.data.movieDistinctCount
            this.movieCount = response.data.movieCount
            this.versionDistinctCount = response.data.VersionDistinctCount
            this.versionCount = response.data.VersionCount
            this.neo4jTime = response.data.executionTime || 0
            this.hasResult = true
            this.updateChartData()
            this.$message.success('查询成功')
          } else {
            this.$message.error('返回数据格式不正确')
          }
        })
        .catch(error => {
          console.error('Neo4j Error:', error)
          this.$message.error('Neo4j查询失败：' + (error.message || '未知错误'))
        })

      // MySQL 查询
      axios.get('http://localhost:3001/api/harryPotterStatistics')
        .then(response => {
          if (response.data && response.data.queryDuration) {
            this.mysqlTime = response.data.queryDuration
            this.updateChartData()
          }
        })
        .catch(error => {
          console.error('MySQL Error:', error)
          this.$message.error('MySQL查询失败')
        })

      // Hive 查询
      axios.get('http://106.15.36.155:8080/api/movies/harryPotter')
        .then(response => {
          if (response.data && response.data.queryTimeMillis) {
            this.hiveTime = response.data.queryTimeMillis
            this.updateChartData()
          }
        })
        .catch(error => {
          console.error('Hive Error:', error)
          this.$message.error('Hive查询失败')
        })
        .finally(() => {
          this.loading = false
        })
    },

    updateChartData() {
      const neo4jTimeNum = Number(this.neo4jTime)
      const mysqlTimeNum = Number(this.mysqlTime)
      const hiveTimeNum = Number(this.hiveTime)
      
      console.log('更新图表数据:', {
        neo4jTime: neo4jTimeNum,
        mysqlTime: mysqlTimeNum,
        hiveTime: hiveTimeNum
      })

      this.chartData.rows = [
        { '数据库': 'Neo4j', '查询时间': neo4jTimeNum },
        { '数据库': 'MySQL', '查询时间': mysqlTimeNum },
        { '数据库': 'Hive', '查询时间': hiveTimeNum }
      ]
    }
  }
}
</script>

<style scoped>
.content-wrapper {
  padding: 20px;
  text-align: center;
}

.query-title {
  margin-bottom: 40px;
  color: #303133;
  font-size: 20px;
  line-height: 1.5;
}

.button-wrapper {
  margin: 30px 0;
}

.result-wrapper {
  margin-top: 40px;
}

.result-card {
  text-align: center;
  padding: 20px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all 0.3s;
}

.result-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.result-number {
  font-size: 36px;
  color: #409EFF;
  font-weight: bold;
  margin-bottom: 10px;
}

.result-label {
  font-size: 14px;
  color: #606266;
}
</style>
