package com.myclean.marketplace

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

data class PublicJobUi(
    val id: Int,
    val title: String,
    val description: String,
    val city: String,
    val budgetRange: String,
    val bids: List<JobBidUi> = emptyList()
)

data class JobBidUi(
    val id: Int,
    val cleanerName: String,
    val price: String,
    val message: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PostPublicJobForm(
    modifier: Modifier = Modifier,
    onSubmit: suspend (title: String, desc: String, city: String, budget: String, date: String) -> Unit
) {
    val scope = rememberCoroutineScope()
    var title by remember { mutableStateOf(TextFieldValue()) }
    var desc by remember { mutableStateOf(TextFieldValue()) }
    var city by remember { mutableStateOf(TextFieldValue()) }
    var budget by remember { mutableStateOf(TextFieldValue()) }
    var date by remember { mutableStateOf(TextFieldValue()) }
    var isSubmitting by remember { mutableStateOf(false) }

    Column(modifier = modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Title") })
        OutlinedTextField(value = desc, onValueChange = { desc = it }, label = { Text("Description") })
        OutlinedTextField(value = city, onValueChange = { city = it }, label = { Text("City") })
        OutlinedTextField(value = budget, onValueChange = { budget = it }, label = { Text("Budget range e.g. 120-160") })
        OutlinedTextField(value = date, onValueChange = { date = it }, label = { Text("Preferred date (yyyy-MM-dd)") })
        Button(
            enabled = !isSubmitting && title.text.isNotBlank() && desc.text.isNotBlank(),
            onClick = {
                scope.launch {
                    isSubmitting = true
                    onSubmit(title.text, desc.text, city.text, budget.text, date.text)
                    isSubmitting = false
                }
            }
        ) {
            Text(if (isSubmitting) "Posting…" else "Post Job")
        }
    }
}

@Composable
fun CleanerMarketplaceList(
    jobs: List<PublicJobUi>,
    onBidClick: (PublicJobUi) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(modifier = modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items(jobs) { job ->
            Card(onClick = { onBidClick(job) }) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(job.title)
                    Text(job.description, maxLines = 2)
                    Text("${job.city} • ${job.budgetRange}")
                    Text("${job.bids.size} bids")
                }
            }
        }
    }
}

@Composable
fun ClientBidList(
    job: PublicJobUi,
    onAccept: (JobBidUi) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text(job.title)
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(job.bids) { bid ->
                Card {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(bid.cleanerName)
                        Text("Offer: ${bid.price}")
                        if (bid.message.isNotBlank()) Text(bid.message)
                        Button(onClick = { onAccept(bid) }) {
                            Text("Accept bid")
                        }
                    }
                }
            }
        }
    }
}
