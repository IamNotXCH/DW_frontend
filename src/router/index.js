import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },


  
  {
    path: '/queries',
    component: Layout,
    children: [{
      path: 'index',
      name: 'TimeQuery',
      component: () => import('@/views/queries/time-query'),
      meta: { title: '按时间查询', icon: 'el-icon-time' }
    }]
  },

  {
    path: '/movie-name-query',
    component: Layout,
    children: [{
      path: 'index',
      name: 'MovieNameQuery',
      component: () => import('@/views/queries/movie-name-query'),
      meta: { title: '按电影名称查询', icon: 'movie' }
    }]
  },

  {
    path: '/director-query',
    component: Layout,
    children: [{
      path: 'index',
      name: 'DirectorQuery',
      component: () => import('@/views/queries/director-query'),
      meta: { title: '按导演名称查询', icon: 'user' }
    }]
  },

  {
    path: '/actor-query',
    component: Layout,
    children: [{
      path: 'index',
      name: 'ActorQuery',
      component: () => import('@/views/queries/actor-query'),
      meta: { title: '按演员名称查询', icon: 'user' }
    }]
  },

  {
    path: '/relation-query',
    component: Layout,
    redirect: '/relation-query/table',
    name: 'RelationQuery',
    meta: { title: '按演员导演关系查询', icon: 'el-icon-coordinate' },
    children: [
      {
        path: 'table',
        name: 'Actor',
        component: () => import('@/views/queries/coactor-query'),
        meta: { title: '演员组合', icon: 'movie' }
      },
      {
        path: 'tree',
        name: 'ActorDirector',
        component: () => import('@/views/queries/actor-director-query'),
        meta: { title: '导演演员组合', icon: 'relation' }
      },
      {
        path: 'cooperation',
        name: 'CoActorDirector',
        component: () => import('@/views/queries/CoActorDirector-query'),
        meta: { title: '最受关注的演员组合', icon: 'relation' }
      }
    ]
  },


  {
    path: '/category-query',
    component: Layout,
    children: [{
      path: 'index',
      name: 'CategoryQuery',
      component: () => import('@/views/queries/category-query'),
      meta: { title: '按电影类别查询', icon: 'el-icon-menu' }
    }]
  },



  {
    path: '/comment-query',
    component: Layout,
    redirect: '/comment-query/table',
    name: 'CommentQuery',
    meta: { title: '按用户评价查询', icon: 'el-icon-coordinate' },
    children: [
      {
        path: 'table',
        name: 'comment',
        component: () => import('@/views/queries/comment-query'),
        meta: { title: '用户评价', icon: 'movie' }
      },
      {
        path: 'tree',
        name: 'positive',
        component: () => import('@/views/queries/positive-comment-query'),
        meta: { title: '正面评价', icon: 'relation' }
      }
    ]
  },
  {
    path: '/combined-query',
    component: Layout,
    redirect: '/combined-query/table',
    name: 'CombinedQuery',
    meta: { title: '按组合条件查询', icon: 'el-icon-search' },
    children: [
      {
        path: 'positive',
        name: 'PositiveActorPairs',
        component: () => import('@/views/queries/positive-actor-pairs'),
        meta: { title: '正面评价演员组合', icon: 'relation' }
      },
      {
        path: 'highgrade',
        name: 'HighGradeActorPairs',
        component: () => import('@/views/queries/high-grade-actor-pairs'),
        meta: { title: '高评分演员组合', icon: 'movie' }
      }
    ]
  },

  {
    path: '/form',
    component: Layout,
    redirect: '/form/movie',
    name: 'Form',
    meta: { title: '溯源查询', icon: 'tree' },
    children: [
      {
        path: 'movie',
        name: 'MovieTrace',
        component: () => import('@/views/queries/movie-trace'),
        meta: { title: '哈利波特系列', icon: 'movie' }
      },
      {
        path: 'other',
        name: 'OtherTrace',
        component: () => import('@/views/queries/other-trace'),
        meta: { title: '非电影数据', icon: 'el-icon-data-line' }
      }
    ]
  },

  // {
  //   path: '/nested',
  //   component: Layout,
  //   redirect: '/nested/menu1',
  //   name: 'Nested',
  //   meta: {
  //     title: 'Nested',
  //     icon: 'nested'
  //   },
  //   children: [
  //     {
  //       path: 'menu1',
  //       component: () => import('@/views/nested/menu1/index'), // Parent router-view
  //       name: 'Menu1',
  //       meta: { title: 'Menu1' },
  //       children: [
  //         {
  //           path: 'menu1-1',
  //           component: () => import('@/views/nested/menu1/menu1-1'),
  //           name: 'Menu1-1',
  //           meta: { title: 'Menu1-1' }
  //         },
  //         {
  //           path: 'menu1-2',
  //           component: () => import('@/views/nested/menu1/menu1-2'),
  //           name: 'Menu1-2',
  //           meta: { title: 'Menu1-2' },
  //           children: [
  //             {
  //               path: 'menu1-2-1',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
  //               name: 'Menu1-2-1',
  //               meta: { title: 'Menu1-2-1' }
  //             },
  //             {
  //               path: 'menu1-2-2',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
  //               name: 'Menu1-2-2',
  //               meta: { title: 'Menu1-2-2' }
  //             }
  //           ]
  //         },
  //         {
  //           path: 'menu1-3',
  //           component: () => import('@/views/nested/menu1/menu1-3'),
  //           name: 'Menu1-3',
  //           meta: { title: 'Menu1-3' }
  //         }
  //       ]
  //     },
  //     {
  //       path: 'menu2',
  //       component: () => import('@/views/nested/menu2/index'),
  //       name: 'Menu2',
  //       meta: { title: 'menu2' }
  //     }
  //   ]
  // },

  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://github.com/IamNotXCH/DW_Final',
        meta: { title: 'Github仓库', icon: 'link' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
