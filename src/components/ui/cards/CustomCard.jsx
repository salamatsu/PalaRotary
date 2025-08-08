import { Badge, Card } from "antd";
import React from "react";

const CustomCard = ({ ribbonProps = {}, children, ...props }) => {
  return ribbonProps?.text ? (
    <Badge.Ribbon {...ribbonProps}>
      <Card {...props}>{children}</Card>;
    </Badge.Ribbon>
  ) : (
    <Card {...props}>{children}</Card>
  );
};

export default CustomCard;
