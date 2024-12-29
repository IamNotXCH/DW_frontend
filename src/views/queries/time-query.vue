<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12">
        <el-form ref="form" :model="form" label-width="120px" style="padding-top: 10vh;">
          <el-form-item label="年份" required>
            <el-date-picker
              v-model="form.year"
              type="year"
              placeholder="选择年份"
              style="width: 50%;"
            />
          </el-form-item>

          <el-form-item label="月份">
            <el-select
              v-model="form.month"
              placeholder="选择月份"
              clearable
              style="width: 50%;"
            >
              <el-option
                v-for="item in 12"
                :key="item"
                :label="item + '月'"
                :value="item"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="日期">
            <el-select
              v-model="form.day"
              placeholder="选择日期"
              clearable
              style="width: 50%;"
            >
              <el-option
                v-for="item in daysInMonth"
                :key="item"
                :label="item + '日'"
                :value="item"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="季度">
            <el-select
              v-model="form.quarter"
              placeholder="选择季度"
              clearable
              style="width: 50%;"
            >
              <el-option label="第一季度" value="1" />
              <el-option label="第二季度" value="2" />
              <el-option label="第三季度" value="3" />
              <el-option label="第四季度" value="4" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="searchByTime">查询</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <el-col :span="1">
        <el-divider direction="vertical" />
      </el-col>

      <el-col :span="10">
        <el-tabs v-model="activeName">
          <el-tab-pane label="查询结果" name="first">
            <p v-if="hasResult">共有 {{ movieNumber }} 个结果</p>
            <el-table v-loading="loading" :data="movieData" style="width: 100%" height="460" border stripe>
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
import axios from "axios";

export default {
  name: 'TimeQuery',
  data() {
    return {
      form: {
        year: null,
        month: null,
        day: null,
        quarter: null
      },
      activeName: 'first',
      loading: false,
      hasResult: false,
      movieNumber: 0,
      movieData: [],
      chartData: {
        columns: ['数据库', '查询时间'],
        rows: [
          { '数据库': 'MySQL', '查询时间': 0 },
          { '数据库': 'Hive', '查询时间': 0 },
          { '数据库': 'Neo4j', '查询时间': 0 }
        ]
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
      daysInMonth: 31,
      monthDays: {
        1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
        7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
      },
      BASE_URL: 'http://localhost:8848',
      MYSQL_BASE_URL:'http://localhost:3001/api',
      mysqlTime: 0,
      neo4jTime: 0,
      HIVE_BASE_URL: 'http://localhost:8080/api/hive',
      hiveTime: 0
    }
  },
  methods: {
    searchByTime() {
      if (!this.form.year) {
        this.fetchNeo4jYearData()
        return
      }

      if ((this.form.month !== null || this.form.day !== null) && this.form.quarter !== null) {
        this.$message.warning('不能同时选择月日和季度')
        return
      }

      this.loading = true
      this.hasResult = true

      const year = this.form.year.getFullYear()

      // 如果只选择了年份，调用 Hive 年份接口
      if (this.form.year && !this.form.month && !this.form.day && !this.form.quarter) {
        axios.get(`http://106.15.36.155:8080/api/hive/date/count/year/${year}`)
          .then(response => {
            if (response.data && response.data.queryTimeMillis) {
              this.hiveTime = response.data.queryTimeMillis
              this.updateChartData()
            }
          })
          .catch(error => {
            console.error('Hive请求出错:', error)
            this.$message.error('获取Hive查询时间失败')
          })
      }
      
      // 如果选择了年份和月份，调用 Hive 年月接口
      if (this.form.year && this.form.month && !this.form.day && !this.form.quarter) {
        axios.get(`http://106.15.36.155:8080/api/hive/date/count/year/${year}/month/${this.form.month}`)
          .then(response => {
            if (response.data && response.data.queryTimeMillis) {
              this.hiveTime = response.data.queryTimeMillis
              this.updateChartData()
            }
          })
          .catch(error => {
            console.error('Hive年月请求出错:', error)
            this.$message.error('获取Hive查询时间失败')
          })
      }

      // 如果选择了年月日，调用 Hive 年月日接口
      if (this.form.year && this.form.month && this.form.day && !this.form.quarter) {
        axios.get(`http://106.15.36.155:8080/api/hive/date/count/year/${year}/month/${this.form.month}/day/${this.form.day}`)
          .then(response => {
            if (response.data && response.data.queryTimeMillis) {
              this.hiveTime = response.data.queryTimeMillis
              this.updateChartData()
            }
          })
          .catch(error => {
            console.error('Hive年月日请求出错:', error)
            this.$message.error('获取Hive查询时间失败')
          })
      }

      // 如果选择了季度，使用季度查询接口
      if (this.form.quarter !== null) {
        this.fetchNeo4jQuarterData(year, this.form.quarter)
        return
      }

      // 构建月份查询参数
      let yearMonth = `${year}`
      if (this.form.month) {
        yearMonth += `/${this.form.month}`
      }
      if(this.form.day){
        yearMonth += `/${this.form.day}`
      }

      // 发送请求到Neo4j
      this.fetchNeo4jData(yearMonth)
    },

    fetchNeo4jData(yearMonth) {
      const axios = require('axios')

      axios.get(`${this.BASE_URL}/neo4j/movie/movie-count-by-month`, {
        params: { yearMonth }
      })
        .then(response => {
          console.log('Neo4j response:', response.data)
          if (response.data && response.data.movies) {
            this.movieData = response.data.movies.map(movie => ({
              title: movie.MovieName,
              time: movie.MovieReleaseTime ?
                `${movie.MovieReleaseTime.replace(/(\d+)\/(\d+)\/(\d+)/, '$1年$2月$3日')}` :
                this.formatTime(this.form.year.getFullYear(), this.form.month, this.form.day),
              score: movie.MovieGrade
            }))
            this.movieNumber = response.data.MovieCount
            this.neo4jTime = response.data.time
            this.updateChartData()
          }
          this.loading = false
        })
        .catch(error => {
          console.error('Error fetching Neo4j data:', error)
          this.$message.error('查询失败，请稍后重试')
          this.loading = false
        })



        axios.get(`${this.MYSQL_BASE_URL}/movies/${this.form.year.getFullYear()}/${this.form.month}`)
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

    fetchNeo4jQuarterData(year, quarter) {
      const axios = require('axios')

      axios.get(`${this.BASE_URL}/neo4j/movie/movie-details-by-quarter`, {
        params: {
          year: year,
          quarter: quarter
        }
      })
        .then(response => {
          console.log('Neo4j quarter response:', response.data)
          if (response.data && response.data.movies) {
            this.movieData = response.data.movies.map(movie => ({
              title: movie.MovieName,
              time: movie.MovieReleaseTime ?
                `${movie.MovieReleaseTime.replace(/(\d+)\/(\d+)\/(\d+)/, '$1年$2月$3日')}` :
                `${year}年第${quarter}季度`,
              score: movie.MovieGrade
            }))
            this.movieNumber = response.data.MovieCount

            this.neo4jTime = response.data.time
            this.updateChartData()
          }
          this.loading = false
        })
        .catch(error => {
          console.error('Error fetching Neo4j quarter data:', error)
          this.$message.error('查询失败，请稍后重试')
          this.loading = false
        })

      axios.get(`${this.MYSQL_BASE_URL}/movies/${year}/season/${quarter}`)
          .then(response => {
            console.log('API 返回的查询时间:', response.data)
            console.log('API返回的查询时间',response.data.queryTime)

            if(response.data.queryTime){
              this.mysqlTime = parseInt(response.data.queryTime.replace('ms', '')) || 0
              this.updateChartData()
            }
          })
          .catch(error => {
            console.error('请求新接口出错:', error)
            this.$message.error('获取速度对比数据失败')
          })


    },

    formatTime(year, month, day) {
      let timeStr = `${year}年`
      if (month) {
        timeStr += `${month}月`
      }
      if (day) {
        timeStr += `${day}日`
      }
      return timeStr
    },

    resetForm() {
      this.$refs.form.resetFields()
      this.movieData = []
      this.hasResult = false
      this.movieNumber = 0
      this.chartData.rows = this.chartData.rows.map(row => ({ ...row, '查询时间': 0 }))
    },
    isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
    },
    updateDaysInMonth() {
      if (!this.form.month) {
        this.daysInMonth = 31
        return
      }

      if (this.form.month === 2 && this.form.year) {
        // 处理2月份闰年情况
        this.daysInMonth = this.isLeapYear(this.form.year.getFullYear()) ? 29 : 28
      } else {
        this.daysInMonth = this.monthDays[this.form.month]
      }

      // 如果当前选择的日期超过了当月最大天数，重置日期
      if (this.form.day > this.daysInMonth) {
        this.form.day = null
      }
    },
    fetchNeo4jYearData() {
      const axios = require('axios')
      this.loading = true
      this.hasResult = true

      axios.get(`${this.BASE_URL}/neo4j/movie/movie-count-by-year`)
        .then(response => {
          console.log('Neo4j year response:', response.data)
          if (response.data && response.data.movieCountByYear) {
            // 将年度统计数据转换为表格数据
            this.movieData = response.data.movieCountByYear.map(item => ({
              title: `${item.year}年电影数量`,
              time: `${item.year}年`,
              score: item.movieCount // 使用电影数量代替评分
            }))

            // 计算总电影数量
            this.movieNumber = response.data.movieCountByYear.reduce((sum, item) => sum + item.movieCount, 0)

            this.neo4jTime = response.data.time
            this.updateChartData()
          }
          this.loading = false
        })
        .catch(error => {
          console.error('Error fetching Neo4j year data:', error)
          this.$message.error('查询失败，请稍后重试')
          this.loading = false
        })

      axios.get(`${this.MYSQL_BASE_URL}/movies/time`)
          .then(response => {
            console.log('API 返回的查询时间:', response.data)
            console.log('API返回的查询时间',response.data.queryTime)

            if(response.data.queryTime){
              this.mysqlTime = parseInt(response.data.queryTime.replace('ms', '')) || 0
              this.updateChartData()
            }

          })
          .catch(error => {
            console.error('请求新接口出错:', error)
            this.$message.error('获取速度对比数据失败')
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

      this.chartData = {
        columns: ['数据库', '查询时间'],
        rows: [
          { '数据库': 'Neo4j', '查询时间': neo4jTimeNum },
          { '数据库': 'MySQL', '查询时间': mysqlTimeNum },
          { '数据库': 'Hive', '查询时间': hiveTimeNum }
        ]
      }
    }
  },
  watch: {
    'form.month': function(val) {
      if (val !== null) {
        this.form.quarter = null
        this.updateDaysInMonth()
      } else {
        this.form.day = null
      }
    },
    'form.day': function(val) {
      if (val !== null) {
        this.form.quarter = null
      }
    },
    'form.quarter': function(val) {
      if (val !== null) {
        this.form.month = null
        this.form.day = null
      }
    },
    'form.year': function() {
      this.updateDaysInMonth()
    }
  }
}
</script>

<style scoped>
.el-divider--vertical {
  height: 75vh;
}
</style>
