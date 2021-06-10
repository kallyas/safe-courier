import { MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';


const data = {
    columns: [
        {
            sort: 'asc'
        },
        {
            sort: 'asc'
        },
        {
            sort: 'asc'
        },
        {
            sort: 'asc'
        },
        {
            sort: 'asc'
        },
        {
            sort: 'asc'
        }
    ],
    rows: [
        {
            'type': '📦Courier',
            'sender': 'Linkoln st 34/a',
            'reciever': 'LK 2391 2330 78',
            'date': '25 Jan 2020',
            'status': 'Transit',
            'price': '$20',
        },
        {
            'type': '📦Courier',
            'sender': 'Linkoln st 34/a',
            'reciever': 'LK 2391 2330 78',
            'date': '25 Jan 2020',
            'status': 'Transit',
            'price': '$20',
        },
        {
            'type': '📦Courier',
            'sender': 'Linkoln st 34/a',
            'reciever': 'LK 2391 2330 78',
            'date': '25 Jan 2020',
            'status': 'Transit',
            'price': '$20',
        },
    ]
}

function ParcelList() {
    return (
        <MDBTable responsive>
        <MDBTableHead columns={data.columns} />
        <MDBTableBody rows={data.rows} />
        </MDBTable>
    )
}

export default ParcelList
