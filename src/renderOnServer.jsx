import IsomorphicRouter from 'isomorphic-relay-router';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { match } from 'react-router';
import Relay from 'react-relay';
import routes from './routes';
import injectNetworkLayer from './components/injectNetworkLayer';
import Helmet from 'react-helmet';

const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 9090;
const GRAPHQL_HOST = process.env.GRAPHQL_HOST || 'localhost';

const networkLayer = injectNetworkLayer(`http://${GRAPHQL_HOST}:${GRAPHQL_PORT}/graphql`);

export default (req, res, next) => {
  match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
    if (error) {
      next(error);
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      IsomorphicRouter.prepareData(renderProps, networkLayer).then(render).catch(next);
    } else {
      res.status(404).send('Not Found');
    }

    function render({ data, props }) {
      const reactOutput = ReactDOMServer.renderToString(IsomorphicRouter.render(props));

      // The order in which the html head elements should be rendered.
      const headOrder = ['title', 'base', 'meta', 'link', 'script', 'style'];
      const helmetOutput = Helmet.rewind();

      const htmlHead = headOrder.map((key) => helmetOutput[key].toString().trim()).join('');
      const htmlAttributes = helmetOutput.htmlAttributes.toString();

      res.render(path.resolve(__dirname, 'views', 'index.ejs'), {
        preloadedData: data,
        reactOutput,
        htmlHead,
        htmlAttributes,
      });
    }
  });
};
