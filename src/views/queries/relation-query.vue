<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>演员导演关系查询</span>
      </div>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="按照演员和导演的关系进行查询及统计" name="1">
          <div v-for="(content, key) in relationQueries" 
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
  name: 'RelationQuery',
  data() {
    return {
      activeNames: ['1'],
      selectedQuery: '',
      queryResult: null,
      relationQueries: {
        'query1': '查询演员与导演的合作次数',
        'query2': '查询导演最常合作的演员',
        'query3': '查询演员最常合作的导演',
        'query4': '查询演员导演合作的评分统计'
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