const extend = require('extend');

const State = {
    SUCCESS: 200,
    ERROR: 404
};

const DataType = {
    JSON: 'application/json',
    TEXT: 'text/plain'
};

const DEFAULT_OPTIONS = {
  data: '',
  dataType: DataType.TEXT,
  state: State.SUCCESS
};

function writeData(options ,req, res, next) {
    options = extend(true, {}, DEFAULT_OPTIONS, options);

    res.writeHead(options.state, {
        "Content-type": `${options.dataType};charset=UTF-8`
    });
    res.write(options.data);
    res.end();
    next();
}

module.exports = {
    routes: [
        {
            route: '/api',
            handle: function (req, res, next) {
                writeData({
                    data: 'hello world'
                }, req, res, next);
            }
        }
    ]
};