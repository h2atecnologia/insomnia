// @flow
import * as React from 'react';
import Tooltip from '../tooltip';
import SidebarItem from './sidebar-item';
import SvgIcon, { IconEnum } from '../svg-icon';
import SidebarSection from './sidebar-section';

type Props = {
  responses: Object,
  onClick: (section: string, path: Array<mixed>) => void,
};

// Implemented as a class component because of a caveat with render props
// https://reactjs.org/docs/render-props.html#be-careful-when-using-render-props-with-reactpurecomponent
export default class SidebarResponses extends React.Component<Props> {
  renderBody = (filter: string): null | React.Node => {
    const { responses, onClick } = this.props;

    const filteredValues = Object.keys(responses).filter(response =>
      response.toLowerCase().includes(filter.toLocaleLowerCase()),
    );

    if (!filteredValues.length) {
      return null;
    }

    return (
      <div>
        {filteredValues.map(response => (
          <SidebarItem key={response}>
            <div>
              <SvgIcon icon={IconEnum.indentation} />
            </div>
            <span onClick={() => onClick('components', ['responses', response])}>
              <Tooltip message={responses[response].description} position="right">
                {response}
              </Tooltip>
            </span>
          </SidebarItem>
        ))}
      </div>
    );
  };

  render() {
    return <SidebarSection title="RESPONSES" renderBody={this.renderBody} />;
  }
}
