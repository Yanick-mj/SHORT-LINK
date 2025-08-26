import React from 'react';
import { BarLoader } from 'react-spinners';
import { Card, CardHeader, CardTitle, CardContent, } from '@/components/ui/card';

const Dasboard = () => {
  return (
    <div>
      <BarLoader width={"100%"} color="#36d7b7" />

      <div>
        <Card>
            <CardHeader>
              <CardTitle>Links created</CardTitle>
            </CardHeader>
            <CardContent>
              0
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
              <CardTitle>Total clicks</CardTitle>
            </CardHeader>
            <CardContent>
              0
            </CardContent>
        </Card>
      </div>
    </div>
  )
};

export default Dasboard;
