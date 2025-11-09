package com.myclean.payments

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.PaymentSheetResult
import com.stripe.android.paymentsheet.rememberPaymentSheet
import kotlinx.coroutines.launch

@Composable
fun BookingPaymentScreen(
    clientSecretProvider: suspend () -> ClientSecretResult,
    onPaymentSuccess: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scope = rememberCoroutineScope()
    val paymentSheet = rememberPaymentSheet(onPaymentResult = { result ->
        if (result is PaymentSheetResult.Completed) onPaymentSuccess()
    })
    var isLoading by remember { mutableStateOf(false) }

    Column(modifier = modifier.padding(24.dp)) {
        Button(
            enabled = !isLoading,
            onClick = {
                scope.launch {
                    isLoading = true
                    when (val result = clientSecretProvider()) {
                        is ClientSecretResult.Success -> {
                            paymentSheet.presentWithPaymentIntent(
                                paymentIntentClientSecret = result.clientSecret,
                                configuration = PaymentSheet.Configuration(merchantDisplayName = "MyClean")
                            )
                        }
                        is ClientSecretResult.Error -> {
                            isLoading = false
                        }
                    }
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(if (isLoading) "Preparing…" else "Pay securely")
        }
    }
}

sealed interface ClientSecretResult {
    data class Success(val clientSecret: String) : ClientSecretResult
    object Error : ClientSecretResult
}
