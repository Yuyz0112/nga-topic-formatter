import React, { Component } from 'react';
import cn from 'classnames';
import qs from 'query-string';
import Filter from './components/Filter';

const PORT = 6006;
const urlReg = /^.+read\.php\?tid=(.+)$/;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
      invalid: false,
      isLoading: false,
    };
    this.handleUrlChange = this.handleUrlChange.bind(this);
  }

  handleUrlChange(event) {
    const url = event.currentTarget.value;
    const invalid = !urlReg.test(url);
    this.setState({ url, invalid });
    if (!invalid) {
      this.fetchData(qs.parse(qs.extract(url)).tid);
    }
  }

  fetchData(tid) {
    this.setState({
      data: undefined,
      isLoading: true,
    });
    const url = process.env.NODE_ENV === 'production'
      ? `https://${window.location.hostname}?tid=${tid}`
      : `http://${window.location.hostname}:${PORT}?tid=${tid}`;
    fetch(url)
      .then(res => res.text())
      .then(text => {
        const { data } = JSON.parse(
          text
            .replace('window.script_muti_get_var_store=', '')
            .replace(/(\t|\r|\n)/g, '')
        );
        this.setState({
          data,
          isLoading: false,
        });
      })
      .catch(error => this.setState({ error, isLoading: false }));
  }

  render() {
    const { url, invalid, isLoading, error, data } = this.state;

    return (
      <div className="App">
        <div className="row">
          <label htmlFor="url">NGA帖子链接</label>
          <input
            className={cn('u-full-width', { invalid })}
            type="url"
            placeholder="例如：http://bbs.nga.cn/read.php?tid=11817033"
            id="exampleEmailInput"
            value={url}
            onChange={this.handleUrlChange}
          />
        </div>
        <div className="row">
          {isLoading && <p>读取中...</p>}
          {error && <p>{error}</p>}
          {data && (
            <div>
              <Filter data={data} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;
