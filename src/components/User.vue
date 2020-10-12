<template>
  <div>
<!--    面包屑导航部分-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search"  @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名" ></el-table-column>
        <el-table-column prop="mobile" label="电话" ></el-table-column>
        <el-table-column prop="email" label="邮箱" ></el-table-column>
        <el-table-column prop="role_name" label="角色" ></el-table-column>
        <el-table-column  label="状态" >
<!--          当在此列设置了template，则不用设值prop属性-->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state" @change="userStatusChange(scope.row)"
              active-color="#409eff">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column  label="操作" >
          <template  slot-scope="scope">
<!--            修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
<!--            删除按钮-->
            <el-button class="m-button" type="danger" icon="el-icon-delete" size="mini"  @click="removeUserById(scope.row.id)"></el-button>
<!--            分配权限-->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 3, 5, 7]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
<!--    添加用户对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="40%"
      @close="addClosed"
      >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" ></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="tel">
          <el-input v-model="addForm.mobile" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addUser">确 定</el-button>
  </span>
    </el-dialog>
<!--    修改用户信息对话框-->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="40%"
      @click="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 自定义校验规则
    var checkTel = (rules, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        callback()
      }
      callback(new Error('请输入正确的电话号码！'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 1
      },
      userlist: [],
      total: 0,
      // 添加用户信息的标志
      dialogVisible: false,
      // 添加表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单验证
      addFormRules: {
        username: [{
          required: true, message: '请输入用户名', trigger: 'blur'
        },
        {
          min: 3,
          max: 10,
          message: '用户名的长度在3-10字符之间',
          trigger: 'blur'
        }
        ],
        password: [{
          required: true, message: '请输入用户密码', trigger: 'blur'
        },
        {
          min: 6,
          max: 15,
          message: '用户密码的长度在6-15字符之间',
          trigger: 'blur'
        }
        ],
        email: [{
          required: true, message: '请输入用户邮箱', trigger: 'blur'
        },
        {
          type: 'email',
          message: '请输入正确的邮箱地址',
          trigger: ['blur', 'change']
        }
        ],
        mobile: [{
          required: true, message: '请输入用户电话', trigger: 'blur'
        },
        {
          validator: checkTel, message: '请输入正确的电话格式', trigger: 'blur'
        }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [{
          required: true,
          trigger: 'blur'
        },
        {
          type: 'email',
          message: '请输入正确的邮箱',
          trigger: 'blur'
        }],
        mobile: [{
          required: true,
          trigger: 'blur'
        },
        {
          validator: checkTel,
          message: '请输入正确的电话号码',
          trigger: 'blur'
        }]
      }
    }
  },
  created() {
    // 发起首屏请求
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userlist = res.data.users
      this.total = res.data.total
      console.log('初始获取用户信息时' + res)
    },
    handleSizeChange(newsize) {
      // 每拿到一次数据都要发起请求
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    handleCurrentChange(newpage) {
      // 每拿到一次数据都要发起请求
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    async userStatusChange(userInfo) {
      console.log('用户状态改变前的状态' + userInfo)
      const { data: res } = await this.$http.put(`/users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        return this.$message.error('更新用户状态失败！')
      }
      return this.$message.success('更新用户成功')
    },
    // 关闭方法
    addClosed() {
      // 得到引用，将其内容置空
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户方法
    addUser() {
      // 拿到引用，再添加一个箭头函数
      this.$refs.addFormRef.validate(async valid => {
        // 打印当前状态
        console.log('新添用户时：' + valid)
        // 如果没有获得成功，则返回
        if (!valid) return
        // 发起添加用户请求
        const { data: res } = await this.$http.post('users', this.addForm)
        // 得到状态，根据文档查看，看得到的状态码是不是201,出现一个提示信息
        if (res.status !== 201) this.$message.error('添加用户失败！')
        this.$message.success('添加用户成功')
        // 添加成功之后，将状态置为false，即表示清空
        this.dialogVisible = false
        await this.getUserList()
      })
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('/users/' + id)
      if (res.meta.status !== 200) this.$message.error('查询用户信息失败')
      this.editForm = res.data
      console.log('此用户的原始信息id是' + this.editForm.id)
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editUser() {
      // 预校验
      this.$refs.editFormRef.validate(async valid => {
        console.log('修改的预校验时' + valid)
        console.log('修改的预校验时' + this.editForm.id)
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        console.log('预校验时获取的数据是' + res)
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户修改信息失败！')
        }
        this.editDialogVisible = false
        await this.getUserList()
        this.$message.success('用户信息修改成功')
      })
    },
    async removeUserById(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      // eslint-disable-next-line no-undef
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }

      this.$message.success('删除用户成功')
      await this.getUserList()
    }
  }
}
</script>

<style scoped>
  .el-breadcrumb{
  margin-bottom: 15px;
  font-size: 14px;
}
  .el-card{
    box-shadow: 0 1px 1px rgba(0,0,0, 0.15);
  }
  .el-table{
    margin-top: 15px;
    font-size: 14px;
  }
</style>
