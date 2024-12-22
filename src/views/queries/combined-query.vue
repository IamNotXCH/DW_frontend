<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>组合条件查询统计</span>
      </div>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="按照上述条件的组合查询和统计" name="1">
          <div v-for="(content, key) in combinedQueries" 
               :key="key" 
               @click="handleQuery(key)"
               :class="{ highlighted: selectedQuery === key }"
               class="query-item">
            {{ content }}
          </div>
        </el-collapse-item>
      </el-collapse>
      
      <div class="query-result" v-if="queryResult">
        <!-- 查询结果展示区域 -->
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CombinedQuery',
  data() {
    return {
      activeNames: ['1'],
      selectedQuery: '',
      queryResult: null,
      combinedQueries: {
        'query1': '按时间和类别组合查询',
        'query2': '按演员和导演组合查询',
        'query3': '按评分和类别组合查询',
        'query4': '多条件综合统计分析'
      }
    }
  },
  methods: {
    handleQuery(key) {
      this.selectedQuery = key
      // 实现查询逻辑
    }
  }
}
</script>

<style scoped>
.query-item {
  padding: 10px;
  cursor: pointer;
}
.query-item:hover {
  background-color: #f5f7fa;
}
.highlighted {
  background-color: #ecf5ff;
}
.query-result {
  margin-top: 20px;
}
</style> 