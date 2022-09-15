import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'

import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader,
  Modal,
  Form,
  TextArea,
  Popup,
  Table,
} from 'semantic-ui-react'

import { createInvoice, deleteInvoice, getInvoices, findInvoicesByName, patchInvoice, download } from '../api/invoices-api'
import Auth from '../auth/Auth'
import { Invoice } from '../types/Invoice'
interface InvoicesProps {
  auth: Auth
  history: History
}

interface InvoicesState {
  invoices: Invoice[]
  newInvoiceName: string
  loadingInvoices: boolean
  show: boolean,
  invoiceUpdate: Invoice,
  searchValue: string,
  file: any,
  update: boolean
}

export class Invoices extends React.PureComponent<InvoicesProps, InvoicesState> {
  emptyInvoice: Invoice = { invoiceId: "", createdAt: "", title: "", content: "", price: "", urlImage: "" }
  state: InvoicesState = {
    invoices: [],
    newInvoiceName: '',
    loadingInvoices: true,
    show: false,
    invoiceUpdate: this.emptyInvoice,
    searchValue: '',
    file: undefined,
    update: false
  }

  // handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   this.setState({ newInvoiceName: event.target.value })
  // }
  handleClose = () => { this.setState({ show: false }) };
  handleShow = () => { this.setState({ show: true }) };

  onInvoiceCreate = async () => {
    try {
      const dueDate = this.calculateDueDate()
      const newInvoice = await createInvoice(this.props.auth.getIdToken(), {
        title: this.state.invoiceUpdate.title,
        content: this.state.invoiceUpdate.content,
        price: this.state.invoiceUpdate.price,
      }, this.state.file[0]
      )
      this.componentDidMount()
    } catch {
      alert('Invoice creation failed')
    }
  }
  onInvoiceUpdate = async () => {
    console.log("id", this.state.invoiceUpdate.invoiceId)
    console.log("title", this.state.invoiceUpdate.title)

    console.log("content", this.state.invoiceUpdate.content)
    console.log("price", this.state.invoiceUpdate.price)

    console.log("urlImage", this.state.invoiceUpdate.urlImage)

    try {

      await patchInvoice(this.props.auth.getIdToken(), this.state.invoiceUpdate.invoiceId, {
        title: this.state.invoiceUpdate.title,
        content: this.state.invoiceUpdate.content,
        price: this.state.invoiceUpdate.price,
        urlImage: this.state.invoiceUpdate.urlImage,
      }, this.state.file != null ? this.state.file[0] : null).then(() => {
        this.componentDidMount()
      }
      )
    } catch {
      alert('Invoice updated failed')
    }
  }



  onSearch = async () => {
    try {
      if (this.state.searchValue !== "") {
        const newInvoice = await findInvoicesByName(this.props.auth.getIdToken(), this.state.searchValue)
        if ((newInvoice.length) !== 0) {
          console.log(newInvoice)
          this.setState({
            invoices: newInvoice,
            searchValue: ""
          })
        } else {
          this.setState({
            searchValue: ""
          })
          alert('Can not find invoices')
        }

      }
    } catch {
      alert('Can not find invoices')
    }
  }


  onInvoiceDelete = async (invoiceId: string) => {
    try {
      await deleteInvoice(this.props.auth.getIdToken(), invoiceId)
      this.setState({
        invoices: this.state.invoices.filter(todo => todo.invoiceId !== invoiceId)
      })
    } catch {
      alert('Invoice deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const invoices = await getInvoices(this.props.auth.getIdToken())
      this.setState({
        invoices,
        loadingInvoices: false
      })
    } catch (e) {
      alert(`Failed to fetch invoice: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">MANAGEMENT INVOICE </Header>
        {this.renderSearch()}
        {this.renderCreateInvoiceInput()}
        {this.renderInvoices()}
        {this.renderModal()}
        {this.renderInvoicesList()}
      </div>
    )
  }
  renderSearch() {
    return (
      <Form onSubmit={() => {
        this.onSearch()
        this.renderInvoicesList()

      }}>
        <Form.Group>
          <input placeholder='Title' onChange={(e) => {
            this.state.searchValue = e.target.value
            this.setState({ searchValue: this.state.searchValue })
          }} />
          <Button color='green' type='submit'><Icon name="search" /></Button>
          <Button color='blue' onClick={() => {
            this.componentDidMount()
            this.renderInvoicesList()

          }} ><Icon name="sync" />clear</Button>

        </Form.Group>
      </Form>
    )
  }

  renderCreateInvoiceInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>

          <Button
            icon
            color="blue"
            onClick={() => {
              this.handleShow()
            }}
          >
            <Icon name="add" />create new invoice
          </Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderInvoices() {
    if (this.state.loadingInvoices) {
      return this.renderLoading()
    }
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading INVOICES
        </Loader>
      </Grid.Row>
    )
  }


  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }


  renderInvoicesList() {
    return (
      <Table celled padded>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textAlign="center">Title</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Detail</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Price</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Date</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Bill</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {this.state.invoices.map((todo, pos) => {
            return (
              <Table.Row key={todo.invoiceId}>
                <Table.Cell width={2}> {todo.title}</Table.Cell>
                <Table.Cell width={4}> {todo.content}</Table.Cell>
                <Table.Cell width={2}> {todo.price}</Table.Cell>
                <Table.Cell width={2}> {todo.createdAt}</Table.Cell>
                <Table.Cell width={1}>
                  {" "}
                  {todo.urlImage && (
                    <Image size="tiny" src={todo.urlImage} />
                  )}
                </Table.Cell>
                <Table.Cell width={2} textAlign="center">
                  {" "}
                  {todo.urlImage && (
                    <Popup
                      content="Download attachment"
                      trigger={
                        <Button
                          icon
                          color="green"
                          onClick={() => this.onDownloadAttachment(todo.invoiceId)}
                        >
                          <Icon name="download" />
                        </Button>
                      }
                    />
                  )}
                  <Popup
                    content="Update"
                    trigger={
                      <Button
                        icon
                        color="blue"
                        onClick={() => {
                          this.handleShow()
                          this.setState({ invoiceUpdate: todo, update: true })
                        }}
                      >
                        <Icon name="pencil" />
                      </Button>
                    }
                  />
                  <Popup
                    content="Delete"
                    trigger={
                      <Button
                        icon
                        color="red"
                        onClick={() => this.onInvoiceDelete(todo.invoiceId)}
                      >
                        <Icon name="delete" />
                      </Button>
                    }
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
  }
  onDownloadAttachment = async (invoiceId: string) => {
    const todo = this.state.invoices.find((todo) => todo.invoiceId === invoiceId);
    if (todo?.urlImage) {
      const urlImage = todo.urlImage;
      const urlImageParts = urlImage.split("/");
      const length = urlImageParts.length;
      const s3Key = `${urlImageParts[length - 2]}/${urlImageParts[length - 1]
        }`;

      // const downloadUrl = await getDownloadUrl(
      //   this.props.auth.getIdToken(),
      //   s3Key
      // );
      download(urlImage, urlImageParts[length - 1]);
    }
  };
  renderModal() {
    return (
      <Modal
        onClose={() => this.handleClose()}
        onOpen={() => this.handleShow()}
        open={this.state.show}
      >
        <Modal.Header>{this.state.invoiceUpdate.title !== "" ? "Update Invoice" : "Create Invoice"}</Modal.Header>
        <Modal.Content >
          <Form onSubmit={() => {
            if (this.state.update == true) {
              this.onInvoiceUpdate()
              this.handleClose()
              this.setState({ invoiceUpdate: this.emptyInvoice, file: undefined, update: false })
            } else {
              this.onInvoiceCreate()
              this.handleClose()
              this.setState({ invoiceUpdate: this.emptyInvoice, file: undefined, update: false })
            }

          }}>
            <Form.Field>
              <label>Title</label>
              <input placeholder='Title' defaultValue={this.state.invoiceUpdate.title} onChange={(e) => {
                this.state.invoiceUpdate.title = e.target.value
                this.setState({ invoiceUpdate: this.state.invoiceUpdate })
              }} />
            </Form.Field>
            <Form.Field>
              <label>Detail</label>
              <TextArea placeholder='Content' defaultValue={this.state.invoiceUpdate.content} onChange={(e) => {
                this.state.invoiceUpdate.content = e.target.value
                this.setState({ invoiceUpdate: this.state.invoiceUpdate })
              }} />
            </Form.Field>
            <Form.Field>
              <label>Price</label>
              <input placeholder='Price' type='number' defaultValue={this.state.invoiceUpdate.price} onChange={(e) => {
                this.state.invoiceUpdate.price = e.target.value
                this.setState({ invoiceUpdate: this.state.invoiceUpdate })
              }} />
            </Form.Field>
            <Form.Field>
              <label>Change Image</label>
              <input type="file" id="img" name="img" accept="image/*" onChange={(e) => {
                this.state.file = e.target.files
                this.setState({ file: this.state.file })
              }} />
            </Form.Field>
            <Button color='black' onClick={() => {
              this.handleClose()
              this.setState({ invoiceUpdate: this.emptyInvoice })
            }}>
              Close
            </Button>
            <Button color='green' type='submit'>Submit</Button>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}




