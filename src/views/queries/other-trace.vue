<template>
    <div class="app-container">
      <el-row type="flex" justify="center">
        <el-col :span="16">
          <div class="content-wrapper">
            <h2 class="query-title">在过程中，我们找出了多少非电影的数据</h2>
            
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
              <el-card class="result-card">
                <div class="result-number">{{ count }}</div>
                <div class="result-label">条非电影数据</div>
              </el-card>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  
  export default {
    name: 'OtherTrace',
    data() {
      return {
        loading: false,
        hasResult: false,
        count: 0,
        MYSQL_BASE_URL: 'http://localhost:3001/api'
      }
    },
    methods: {
      fetchData() {
        this.loading = true
        axios.get(`${this.MYSQL_BASE_URL}/dropProductCount`)
          .then(response => {
            if (response.data && response.data.dropProductCount) {
              this.count = response.data.dropProductCount
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
    font-size: 24px;
  }
  
  .button-wrapper {
    margin: 30px 0;
  }
  
  .result-wrapper {
    margin-top: 40px;
    display: flex;
    justify-content: center;
  }
  
  .result-card {
    width: 300px;
    text-align: center;
    padding: 20px;
  }
  
  .result-number {
    font-size: 48px;
    color: #409EFF;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .result-label {
    font-size: 16px;
    color: #606266;
  }
  </style>