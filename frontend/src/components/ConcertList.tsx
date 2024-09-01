import React from 'react';
import { List } from 'antd';

interface ConcertListProps {
  concerts: string[];
  onSelect: (concert: string) => void;
}

const ConcertList: React.FC<ConcertListProps> = ({ concerts, onSelect }) => {
  return (
    <List
      header={<div>รายการคอนเสิร์ต</div>}
      bordered
      dataSource={concerts}
      renderItem={item => (
        <List.Item onClick={() => onSelect(item)}>
          {item}
        </List.Item>
      )}
    />
  );
};

export default ConcertList;
