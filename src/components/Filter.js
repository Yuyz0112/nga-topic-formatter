import React, { PureComponent } from 'react';
import pretty from 'pretty';

const DOUBLE_BR = '<br/><br/>';
const styleTags = [
  /\[(color|font|size|h|b|u|i|del|align|l|r|list|quote|code|collapse|randomblock)(|=.*?)]/g,
  /\[\/(color|font|size|h|b|u|i|del|align|l|r|list|quote|code|collapse|randomblock)]/g,
  /===/g,
  /\[\*\]/g,
  /\[(dice)\].*?\[\/dice]/g,
  /\[(crypt)\].*?\[\/crypt]/g,
  /\[(tid)((|=).*?)\].*?\[\/tid]/g,
  /\[(pid)((|=).*?)\].*?\[\/pid]/g,
  /\[(uid)((|=).*?)\].*?\[\/uid]/g,
  /\[s:.*?:.*?]/g,
];
const imageTag = /\[img](.+?)\[\/img]/;
const imageTagG = /\[img](.+?)\[\/img]/g;
const albumTag = /\[album(|=.*?)]((.|\n|\r)+?)\[\/album]/;
const albumTagG = /\[album(|=.*?)]((.|\n|\r)+?)\[\/album]/g;
const urlTag = /\[url](.+?)\[\/url]/;
const urlTagG = /\[url](.+?)\[\/url]/g;
const multiBrTag = num => new RegExp(`((<br(|\\/)>)|\\n){${num},}`, 'g');
const tdTag = /(|<br(|\/)>)\[td\s*?(|(\d|\.)*?)\s*?(|colspan=(\d*?))\s*?(|rowspan=(\d*?))](|<br(|\/)>)/;
const tdTagG = /(|<br(|\/)>)\[td\s*?(|(\d|\.)*?)\s*?(|colspan=(\d*?))\s*?(|rowspan=(\d*?))](|<br(|\/)>)/g;

function setImage(url) {
  if (/^http/.test(url)) {
    return `<img src="${url}" />`;
  }
  return `<img src="http://img.nga.cn/attachments/${url.replace(/^\.\//, '')}" />`;
}
function transformImages(content) {
  const images = content.match(imageTagG) || [];
  let transformed = images.reduce(
    (prev, cur) =>
      prev.replace(cur, setImage(cur.match(imageTag)[1])),
    content
  );
  const albums = content.match(albumTagG) || [];
  transformed = albums.reduce(
    (prev, cur) =>
      prev.replace(cur, cur.match(albumTag)[2].split('\n').filter(s => s).map(setImage).join('\n')),
    transformed
  );
  return transformed;
}
function transformUrl(content) {
  const urls = content.match(urlTagG) || [];
  return urls.reduce(
    (prev, cur) => {
      const url = cur.match(urlTag)[1];
      return prev.replace(cur, `<a href="${url}" target="_blank">${url}</a>`);
    },
    content
  );
}
function transformTable(content, options = {}) {
  const { showTable } = options;
  let transformed = content;
  if (showTable) {
    transformed = content
      .replace(/\[table](|<br(|\/)>)/g, '<table>')
      .replace(/(|<br(|\/)>)\[\/table]/g, '</table>')
      .replace(/(|<br(|\/)>)\[tr](|<br(|\/)>)/g, '<tr>')
      .replace(/(|<br(|\/)>)\[\/tr](|<br(|\/)>)/g, '</tr>')
      .replace(/(|<br(|\/)>)\[\/td](|<br(|\/)>)/g, '</td>');
    const tds = transformed.match(tdTagG) || [];
    transformed = tds.reduce(
      (prev, cur) => {
        const matchs = cur.match(tdTag);
        const colspan = matchs[6] ? `colspan=${matchs[6]}` : '';
        const rowspan = matchs[8] ? `rowspan=${matchs[8]}` : '';
        const width = matchs[3];
        const style = width ? `style="width: ${width}%;" ` : '';
        return prev.replace(cur, `<td ${style} ${colspan} ${rowspan}>`);
      },
      transformed
    );
  } else {
    transformed = content
      .replace(/\[table](|<br(|\/)>)/g, DOUBLE_BR)
      .replace(/(|<br(|\/)>)\[\/table]/g, DOUBLE_BR)
      .replace(/(|<br(|\/)>)\[tr](|<br(|\/)>)/g, DOUBLE_BR)
      .replace(/(|<br(|\/)>)\[\/tr](|<br(|\/)>)/g, DOUBLE_BR)
      .replace(/(|<br(|\/)>)\[\/td](|<br(|\/)>)/g, DOUBLE_BR)
      .replace(tdTagG, DOUBLE_BR);
  }
  return transformed;
}

function toArray(obj) {
  const arr = []
  for (let key in obj) {
    arr[key] = obj[key];
  }
  return arr;
}

const optionMap = {
  clearBr: '清除所有空行',
  clearMultiBr: '清除多余空行',
  showTable: '保留表格',
};

const Checkbox = props => (
  <div className="Checkbox">
    <label htmlFor={props.id}>{optionMap[props.id]}</label>
    <input
      id={props.id}
      type="checkbox"
      checked={props.value}
      onChange={() => props.onChange(props.id)}
    />
  </div>
)

class Filter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: null,
      clearBr: false,
      clearMultiBr: true,
      showTable: true,
      showCode: false,
    };
    this.handleCheck = this.handleCheck.bind(this);
  }

  handleCheck(id) {
    this.setState(prevState => ({
      [id]: !prevState[id],
    }))
  }

  abstract(content = '') {
    const styleLessContent = styleTags.concat([imageTag, albumTag])
      .reduce((prev, cur) => prev.replace(cur, ''), content);
    return styleLessContent.slice(0, 50);
  }

  clean(content = '') {
    const { clearBr, clearMultiBr, showTable } = this.state;
    let transformed = '';
    transformed = styleTags.reduce((prev, cur) => prev.replace(cur, ''), content);
    transformed = transformImages(transformed);
    transformed = transformUrl(transformed);
    transformed = transformTable(transformed, { showTable });
    if (clearMultiBr) {
      transformed = transformed.replace(multiBrTag(3), DOUBLE_BR);
    }
    if (clearBr) {
      transformed = transformed.replace(multiBrTag(2), '<br/>');
    }
    return transformed;
  }

  render() {
    const { data } = this.props;
    const { activeIndex, showCode } = this.state;

    const { __R, __U: users } = data;
    const rows = toArray(__R);
    const hasSelect = activeIndex !== null;
    const htmlResult = hasSelect && this.clean(rows.find(row => row.lou === activeIndex).content);

    return (
      <div className="Filter">
        <div className="row">
          <div className="eight columns">
            {hasSelect && (
              <div
                className="box"
                onClick={() => this.setState({ activeIndex: null })}
              >
                <p>显示所有楼层</p>
              </div>
            )}
            {rows.filter(row => !hasSelect || activeIndex === row.lou).map((row => (
              <div
                key={row.lou}
                className="box"
                onClick={() => this.setState({ activeIndex: row.lou })}
              >
                <p>
                  <span className="index">{row.lou + 1}楼</span>-
                  <span className="author">用户：{users[row.authorid].username}</span>
                </p>
                <p
                  className="abstract"
                  dangerouslySetInnerHTML={{ __html: this.abstract((row.content)) }}
                />
              </div>
            )))}
          </div>
          <div className="four columns">
            {Object.keys(optionMap).map(option => (
              <Checkbox
                key={option}
                id={option}
                onChange={this.handleCheck}
                value={this.state[option]}
              />
            ))}
          </div>
        </div>
        {hasSelect && (
          <div className="row">
            <button
              className="button-primary"
              onClick={() => this.setState({ showCode: !showCode })}
            >
              {showCode ? '显示内容' : '显示源代码'}
            </button>
            {!showCode && (
              <div
                className="result"
                dangerouslySetInnerHTML={{
                  __html: htmlResult,
                }}
              />
            )}
            {showCode && (
              <div className="result">
                <pre>
                  <code>{pretty(htmlResult)}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Filter;
