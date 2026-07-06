declare module 'react-lazylog' {
  import * as React from 'react';

  export interface LazyLogProps {
    text: string;
    follow?: boolean;
    stream?: boolean;
    extraLines?: number;
    enableSearch?: boolean;
    caseInsensitive?: boolean;
    [key: string]: any;
  }

  export class LazyLog extends React.Component<LazyLogProps> {}
}
