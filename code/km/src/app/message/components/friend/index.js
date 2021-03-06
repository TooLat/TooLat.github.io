import './index.scss';

import Header   from '../header';
import Footer   from '~common/components/footer';
import               'pinyin4js';
import _        from 'lodash';
import Models   from '~common/models';

export default {
  name: 'messageFriend',
  data () {
    return {
      page  : 1,
      total : 0,
      per_page: 0,
      current_page: 0,
      last_page: 0,
      formTemp: {
        list: [],
        data: [],
      },
      keyword: '',
      isOpen: false,
      notTotal: 0,
    };
  },
  components: {
    'app-header': Header,
    'app-footer': Footer,
  },
  computed: {
  },
  mounted () {
    this.list();
    this.index();
  },
  watch: {
  },
  methods: {

    // 获取待添加好友请求数据
    index () {
      let self    = this;

      Models.Notify
      .index({
        params: {
          page: self.page,
          type: 3,
        }
      })
      .then((res) => {
        if (1 === res.code) {
          let data = res.data;
          self.notTotal = data.total;
        }
      });

    },

    // 汉字转拼音首字母
    pinyin (value) {
      /* eslint-disable */
      let data = PinyinHelper.convertToPinyinString(value, ' ', PinyinFormat.WITHOUT_TONE);
      data = data.toUpperCase();
      data = data.slice(0, 1);
      let str = /^[A-Za-z]*$/;
      if (str.test(data)) {
        return data;
      }
      return '#';
      /* eslint-enable */
    },

    // 获取同行圈好友列表
    list () {
      let self = this;
      let data = {
        params: {
          page: self.page,
        }
      };

      if (!_.isEmpty(self.keyword)) {
        data.params.name = self.keyword;
      }

      Models.Friend
      .list(data)
      .then((res) => {
        if (1 === res.code) {
          let data = res.data;
          if (1 < self.page) {
            self.formTemp.data = _.concat(self.formTemp.data, data.data);
          }
          else {
            self.formTemp.list = [];
            self.formTemp.data = data.data;
          }

          self.total        = data.total;
          self.per_page     = data.per_page;
          self.current_page = data.current_page;
          self.last_page    = data.last_page;

          _.each(self.formTemp.data, (item) => {
            let chat = item.name ? this.pinyin(item.name) : item.name;
            let arr = _.filter(self.formTemp.list, { chat: chat });

            if (_.isEmpty(arr)) {
              self.formTemp.list.push({
                chat: chat,
                data: [item]
              });
            }
            else {
              arr[0].data.push(item);
            }
          });
        }
      });
    },

    // 搜索
    handleSearch () {
      if (_.isEmpty(this.keyword)) {
        this.$toast('请输入关键字');
        return;
      }

      this.page = 1;
      this.list();
    },

    openSmallPopup () {
      this.isOpen = !this.isOpen;
    },

    refresh (done) {
      let self = this;
      setTimeout(() => {
        self.page = 1;
        this.list();
        done();
      }, 1500);
    },

    infinite (done) {
      if (this.last_page <= this.current_page) {
        setTimeout(() => {
          done(true);
        }, 1500);
        return;
      }

      setTimeout(() => {
        this.page ++;
        this.list();
        done();
      }, 1500);
    }

  }
};