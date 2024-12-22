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
      versionCount: 0
    }
  },
  methods: {
    fetchData() {
      this.loading = true
      axios.get('http://localhost:8848/neo4j/movie/harry-potter-movie-info')
        .then(response => {
          if (response.data) {
            this.movieDistinctCount = response.data.movieDistinctCount
            this.movieCount = response.data.movieCount
            this.versionDistinctCount = response.data.VersionDistinctCount
            this.versionCount = response.data.VersionCount
            this.hasResult = true
            this.$message.success('查询成功')
          } else {
            this.$message.error('返回数据格式不正确')
          }
        })
        .catch(error => {
          console.error('Error:', error)
          this.$message.error('查询失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.loading = false
        })
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
