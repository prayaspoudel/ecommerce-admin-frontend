import React from 'react';
import MaterialTable from 'material-table';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import GridItem from '../../components/Grid/GridItem';
import Button from '../../components/CustomButtons/Button';
import GridContainer from '../../components/Grid/GridContainer';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardBody from '../../components/Card/CardBody';
import PurchaseService from '../../services/PurchaseService';

export default class Purchases extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      purchases: [],
      showPending: true,
      showOnDelivery: true,
      showCustomClearance: true,
      showArrived: true,
    };

    this.rowClicked = this.rowClicked.bind(this);
    this.handleCheckChange = this.handleCheckChange.bind(this);
    this.searchClicked = this.searchClicked.bind(this);
  }

  componentDidMount() {
    this.setState({
      showPending: true,
      showOnDelivery: true,
      showCustomClearance: true,
      showArrived: true,
    });
    this.purchasesList();
  }

  purchasesList() {
    this.setState({ loading: true });

    const {
      showPending,
      showOnDelivery,
      showCustomClearance,
      showArrived,
    } = this.state;

    PurchaseService.getPurchaseDetails(
      showPending,
      showOnDelivery,
      showCustomClearance,
      showArrived,
    )
      .then((data) => this.setState({ purchases: data, loading: false }));
  }

  handleCheckChange(event) {
    this.setState({ [event.target.name]: event.target.checked });
  }

  searchClicked() {
    this.purchasesList();
  }

  rowClicked(_event, rowData) {
    window.open(`/purchase/${rowData.purchaseId}`, '_blank');
  }

  render() {
    const styles = {
      cardCategoryWhite: {
        '&,& a,& a:hover,& a:focus': {
          color: 'rgba(255,255,255,.62)',
          margin: '0',
          fontSize: '14px',
          marginTop: '0',
          marginBottom: '0',
        },
        '& a,& a:hover,& a:focus': {
          color: '#FFFFFF',
        },
      },
      cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
        '& small': {
          color: '#777',
          fontSize: '65%',
          fontWeight: '400',
          lineHeight: '1',
        },
      },
    };

    const columns = [
      { title: 'Purchase Id', field: 'purchaseId', hidden: true },
      { title: 'PO Number', field: 'poNumber' },
      { title: 'Supplier', field: 'supplier', hidden: true },
      { title: 'Product Code', field: 'productCode' },
      { title: 'Product Name', field: 'productName' },
      { title: 'Plan Amount', field: 'planAmount' },
      { title: 'Plan Price', field: 'planPrice', hidden: true },
      { title: 'Plan Overhead Cost', field: 'planOverheadCost', hidden: true },
      {
        title: 'Paid Amount',
        field: 'paidAmount',
        cellStyle: {
          backgroundColor: '#00acc1',
          color: '#FFF',
        },
        headerStyle: {
          backgroundColor: '#00acc1',
          color: '#FFF',
        },
      },
      { title: 'Paid Price', field: 'paidPrice', hidden: true },
      { title: 'Paid Overhead Cost', field: 'paidOverheadCost', hidden: true },
      { title: 'Remain To Pay', field: 'remainToPay' },
      {
        title: 'OnDelivery Amount',
        field: 'onDeliveryAmount',
        cellStyle: {
          backgroundColor: '#e53935',
          color: '#FFF',
        },
        headerStyle: {
          backgroundColor: '#e53935',
          color: '#FFF',
        },
      },
      { title: 'OnDelivery Price', field: 'onDeliveryPrice', hidden: true },
      { title: 'OnDelivery Overhead Cost', field: 'onDeliveryOverheadCost', hidden: true },
      {
        title: 'Custom Clearance Amount',
        field: 'customClearanceAmount',
        cellStyle: {
          backgroundColor: '#fb8c00',
          color: '#FFF',
        },
        headerStyle: {
          backgroundColor: '#fb8c00',
          color: '#FFF',
        },
      },
      { title: 'Custom Clearance Price', field: 'customClearancePrice', hidden: true },
      { title: 'Custom Clearance Overhead Cost', field: 'customClearanceOverheadCost', hidden: true },
      {
        title: 'Arrived Amount',
        field: 'arrivedAmount',
        cellStyle: {
          backgroundColor: '#43a047',
          color: '#FFF',
        },
        headerStyle: {
          backgroundColor: '#43a047',
          color: '#FFF',
        },
      },
      { title: 'Arrived Price', field: 'arrivedPrice', hidden: true },
      { title: 'Arrived Overhead Cost', field: 'arrivedOverheadCost' },
      { title: 'Location', field: 'locationName', hidden: true },
      { title: 'Remain To Arrive', field: 'remainToArrive' },
      { title: 'Arrived Date', field: 'arrivedDate', hidden: true },
    ];

    const options = {
      paging: true,
      pageSizeOptions: [25, 50, 100],
      pageSize: 25,
      columnsButton: true,
      exportButton: true,
      filtering: true,
      rowStyle: (data) => {
        if (data.remainToPay > 0) {
          return {
            backgroundColor: '#e5e3ff',
          };
        }
        if (data.remainToArrive > 0) {
          return {
            backgroundColor: '#fde1e1',
          };
        }
      },
    };

    const {
      purchases,
      loading,
      showPending,
      showOnDelivery,
      showCustomClearance,
      showArrived,
    } = this.state;

    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <Card>
              <CardHeader color="primary">
                <div className={styles.cardTitleWhite}>Purchases</div>
                {loading && <CircularProgress />}
              </CardHeader>
              <CardBody>
                <GridContainer alignItems="flex-end">
                  <GridItem xs={12} sm={12} md={2}>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={showPending}
                          onChange={this.handleCheckChange}
                          value="showPending"
                          name="showPending"
                        />
                      )}
                      label="Show Not Paid"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={2}>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={showOnDelivery}
                          onChange={this.handleCheckChange}
                          value="showOnDelivery"
                          name="showOnDelivery"
                        />
                      )}
                      label="Show On Delivery"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={2}>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={showCustomClearance}
                          onChange={this.handleCheckChange}
                          value="showCustomClearance"
                          name="showCustomClearance"
                        />
                      )}
                      label="Show Custom Clearance"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={2}>
                    <FormControlLabel
                      control={(
                        <Checkbox
                          checked={showArrived}
                          onChange={this.handleCheckChange}
                          value="showArrived"
                          name="showArrived"
                        />
                      )}
                      label="Show Not Arrived"
                    />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={2}>
                    <Button color="primary" onClick={this.searchClicked}>
                      Search
                    </Button>
                  </GridItem>
                </GridContainer>
                <MaterialTable
                  columns={columns}
                  data={purchases}
                  options={options}
                  onRowClick={this.rowClicked}
                  title=""
                // title="Click on each order to navigate to the order details"
                />
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}
