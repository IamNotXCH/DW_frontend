<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>常合作关系查询统计</span>
      </div>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="按照常合作关系进行查询及统计" name="1">
          <div v-for="(content, key) in cooperationQueries" 
               :key="key" 
               @click="handleQuery(key)"
               :class="{ highlighted: selectedQuery === key }"
               class="query-item">
            {{ content }}
          </div>
        </el-collapse-item>
      </el-collapse>
      
      <div class="query-result" v-if="queryResult">
        <el-table
          v-if="tableData.length > 0"
          :data="tableData"
          style="width: 100%"
          border>
          <el-table-column
            v-for="(col, index) in tableCols"
            :key="index"
            :prop="col.prop"
            :label="col.label"
            :width="col.width">
          </el-table-column>
        </el-table>

        <el-empty v-else description="暂无数据"></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CooperationQuery',
  data() {
    return {
      activeNames: ['1'],
      selectedQuery: '',
      queryResult: null,
      cooperationQueries: {
        'query1': '查询经常合作的演员组合',
        'query2': '查询经常合作的导演演员组合',
        'query3': '查询合作次数最多的演员导演',
        'query4': '分析合作关系与评分的关联'
      },
      tableData: [],
      tableCols: []
    }
  },
  methods: {
    handleQuery(key) {
      this.selectedQuery = key
      // 模拟查询数据
      switch(key) {
        case 'query1':
          this.tableCols = [
            { prop: 'actor1', label: '演员1', width: '180' },
            { prop: 'actor2', label: '演员2', width: '180' },
            { prop: 'cooperationCount', label: '合作次数', width: '120' },
            { prop: 'avgRating', label: '平均评分', width: '120' }
          ]
          break
        case 'query2':
          this.tableCols = [
            { prop: 'director', label: '导演', width: '180' },
            { prop: 'actor', label: '演员', width: '180' },
            { prop: 'cooperationCount', label: '合作次数', width: '120' },
            { prop: 'avgRating', label: '平均评分', width: '120' }
          ]
          break
        case 'query3':
          this.tableCols = [
            { prop: 'pair', label: '合作组合', width: '250' },
            { prop: 'cooperationCount', label: '合作次数', width: '120' },
            { prop: 'movieList', label: '代表作品', width: '300' }
          ]
          break
        case 'query4':
          this.tableCols = [
            { prop: 'cooperationLevel', label: '合作程度', width: '120' },
            { prop: 'avgRating', label: '平均评分', width: '120' },
            { prop: 'movieCount', label: '电影数量', width: '120' }
          ]
          break
      }
      // 这里应该调用后端API获取数据
      this.queryResult = true
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
.el-table {
  margin-top: 15px;
}
</style> 