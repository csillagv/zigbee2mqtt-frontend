import React, { Component, FunctionComponent, PropsWithChildren } from "react";
import { CompositeFeature, Endpoint, FeatureAccessMode, GenericExposedFeature } from "../../../types";
import { isBinaryFeature, isClimateFeature, isColorFeature, isCompositeFeature, isCoverFeature, isEnumFeature, isLightFeature, isLockFeature, isNumericFeature, isSwitchFeature, isTextualFeature } from "../../device-page/type-guards";



import { BaseFeatureProps } from "../base";

import Button from "../../button";
import groupBy from "lodash/groupBy";
import { Feature } from "./Feature";



type CompositeType = "composite" | "light" | "switch" | "cover" | "lock" | "fan" | "climate";

interface CompositeProps extends BaseFeatureProps<CompositeFeature> {
  type: CompositeType;
  stepsConfiguration?: object;
}

interface CompositeState {
  [key: string]: unknown;
}



export default class Composite extends Component<CompositeProps, CompositeState> {
  state: Readonly<CompositeState> = {}
  onChange = (endpoint: Endpoint, value: object) => {
    const { onChange, feature } = this.props;
    if (isCompositeFeature(feature)) {
      this.setState(value)
    } else {
      onChange(endpoint, value);
    }
  }
  onApplyClick = () => {
    const { onChange, feature: { endpoint, property } } = this.props;
    onChange(endpoint as Endpoint, property ? { [property]: this.state } : this.state);
  }

  onRead = (endpoint: Endpoint, property: object) => {
    const { onRead, feature } = this.props;
    if (isCompositeFeature(feature)) {
      onRead(endpoint, { [feature.property]: property })
    } else {
      onRead(endpoint, property);
    }

  }
  render() {
    const MAGIC_NO_ENDPOINT = 'MAGIC_NO_ENDPOINT';
    const { feature, device, deviceState } = this.props;
    const { features } = feature;
    const groupedFeatures = groupBy(features, f => f.endpoint ?? MAGIC_NO_ENDPOINT);
    const result = [] as JSX.Element[];
    if (groupedFeatures[MAGIC_NO_ENDPOINT]) {
      result.push(...groupedFeatures[MAGIC_NO_ENDPOINT].map(f => <Feature
        key={f.name}
        feature={f}
        device={device}
        deviceState={deviceState}
        onChange={this.onChange}
        onRead={this.onRead}
      />));
      delete groupedFeatures[MAGIC_NO_ENDPOINT];
    }
    for (const epName in groupedFeatures) {
      const featuresGroup = groupedFeatures[epName];
      result.push(<div key={epName}>Endpoint: {epName}<div className="ps-4">{...featuresGroup.map(f => <Feature
        key={f.name}
        feature={f}
        device={device}
        deviceState={deviceState}
        onChange={this.onChange}
        onRead={this.onRead}
      />)}</div></div>);
    }
    if (isCompositeFeature(feature)) {
      result.push(<div key={feature.name}><Button className="btn btn-primary float-right" onClick={this.onApplyClick}>Apply</Button></div>)
    }
    return result;

  }
}
