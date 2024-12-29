<template>
  <div class="dashboard-container">
    <mavon-editor style="z-index:0" 
    v-model="value" 
    :subfield="false" 
    :defaultOpen="'preview'" 
    :editable='false'
    :toolbarsFlag='false' 
    :navigation='false' />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {mavonEditor} from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
import report from './数据仓库存储项目报告.md'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  data(){
    return{
      value: report
    }
  },
  components: { mavonEditor }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
